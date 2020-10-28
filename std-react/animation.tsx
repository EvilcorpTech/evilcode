import {applyStyles} from '@eviljs/std-web/animation.js'
import {asArray, isArray, isString} from '@eviljs/std-lib/type.js'
import {classes} from './react.js'
import React, {CSSProperties} from 'react'
const {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, cloneElement, Fragment, Children} = React

export let Id = 0

export function Transition(props: TransitionProps) {
    const {children, exit, enter, source, initial, mode, onEntered, onExited, onEnd} = props
    const [state, setState] = useState<TransitionState>(createTransitionState)

    if (children !== state.children) {
        // Component rendered. Let's see what to do with the updated children.
        const observers = {onEntered, onExited, onEnd}
        const enterEvents = enter ?? 0
        const exitEvents = exit ?? 0
        const exchangeMode = mode ?? 'cross'
        const animateInitial = initial ?? false
        const nextState = consumeQueue({
            ...state,
            ...createTransitionStateFrom({
                state,
                children,
                observers,
                exit: exitEvents,
                enter: enterEvents,
                source: asArray(source ?? []),
                exchangeMode,
                animateInitial,
            }),
            children,
            initial: false,
        })

        // We derive the state from the props.
        setState(nextState)
    }

    useEffect(() => {
        if (! macroTaskIsCompleted(state.task)) {
            // Macro task is in progress.
            return
        }

        // Macro task has completed.
        const {task} = state
        const enterObserver = task.find(it => it.flags.includes('enter'))
        const exitObserver = task.find(it => it.flags.includes('exit'))

        if (enterObserver) {
            enterObserver.observers.onEntered?.()
        }
        if (exitObserver) {
            exitObserver.observers.onExited?.()
        }
        if (enterObserver || exitObserver) {
            enterObserver?.observers.onEnd?.()
            exitObserver?.observers.onEnd?.()
        }
        // Observers have been called. We dispose them, avoiding duplicated invocations
        // in case of a forced update due to the queue mutation.
        if (enterObserver) {
            enterObserver.observers = {}
        }
        if (exitObserver) {
            exitObserver.observers = {}
        }

        setState(consumeQueue(state))
    }, [state])

    function onTaskCompleted(srcMicroTask: TransitionTask) {
        setState((state) => {
            const microTask = state.task.find(it => it.id === srcMicroTask.id)

            if (! microTask) {
                console.warn(
                    '@eviljs/std-react/animation.Transition.onTaskCompleted:\n'
                    + 'Missing micro task.'
                )
                return state
            }

            // We mutate the reference in place...
            microTask.completed = true
            // ...so we must force the update.
            return {...state}
        })
    }

    const onMountEnd = useCallback((task: TransitionTask) => {
        onTaskCompleted(task)
    }, [])

    const onUnmountEnd = useCallback((task: TransitionTask) => {
        onTaskCompleted(task)
    }, [])

    return (
        <Fragment>
            {state.task.map((it, idx) =>
                createPresence(it, state.keys[idx], onMountEnd, onUnmountEnd))
            }
        </Fragment>
    )
}

export function TransitionPresence(props: TransitionPresenceProps) {
    const {children, id, type, events, source, onEnd} = props
    const [state, setState] = useState(() => createTransitionPresenceState(id, events))
    const elRef = useRef<HTMLDivElement | null>(null)
    const {lifecycle} = state

    if (id !== state.id) {
        // We derive the state from the id. Which means that when the task is
        // changes, we create a new default state, re-rendering immediately.
        setState(createTransitionPresenceState(id, events))
    }

    useEffect(() => {
        switch (lifecycle) {
            case 'end':
                onEnd?.()
            break
        }
    }, [id, lifecycle])
    // We need id as dependency because the state can transition from
    // 'end' to 'end' again, when the events are 0.

    useLayoutEffect(() => {
        if (type === 'render') {
            return
        }

        if (lifecycle !== 'init')  {
            return
        }

        if (! elRef.current) {
            return
        }

        applyStyles(elRef.current)

        setState((state) =>
            state.lifecycle === 'init'
                ? {...state, lifecycle: 'active'}
                : state
        )
    }, [id, lifecycle])

    const listeners = useMemo(() => {
        if (type === 'render') {
            return
        }

        if (lifecycle === 'end') {
            return
        }

        function onAnimated(event: TransitionPresenceEvent) {
            const isValidEvent = isValidTransitionPresenceEvent(event, source)

            if (! isValidEvent) {
                return
            }

            setState((state) => {
                if (state.lifecycle !== 'active') {
                    return state
                }

                const actualEvents = state.actualEvents + 1

                return {
                    ...state,
                    lifecycle: (actualEvents < state.expectedEvents)
                        ? 'active'
                        : 'end'
                    ,
                    actualEvents,
                } as const
            })
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onTransitionEnd, onAnimationEnd}
    }, [id, type, lifecycle])

    const child = Children.only(children)
    const presenceStyles = transitionPresenceStyles(type, lifecycle)
    const presenceClass = transitionPresenceClasses(type, lifecycle)
    const childProps = {
        ...child.props,
        className: classes(child.props.className, presenceClass),
    }

    return (
        <div
            ref={elRef}
            className={classes('transition-cbb1ec')}
            style={presenceStyles}
            {...listeners}
        >
            {cloneElement(child, childProps)}
        </div>
    )
}

export function TransitionRender(props: TransitionRenderProps) {
    const {children, id, onEnd} = props

    useEffect(() => {
        onEnd?.()
    }, [id])

    return children
}

function createPresence(task: TransitionTask, key: string, onMounted: TransitionTaskEnd, onUnmounted: TransitionTaskEnd) {
    switch (task.action) {
        case 'unmount':
            return createTransitionAnimation(task, key, onUnmounted)
        case 'mount':
            return createTransitionAnimation(task, key, onMounted)
        case 'render':
            // return createTransitionRender(task, key, onMounted)
            return createTransitionAnimation(task, key, onMounted)
    }
}

function createTransitionAnimation(task: TransitionTask, key: string, onEnd: TransitionTaskEnd) {
    return (
        <TransitionPresence
            key={key}
            id={task.id}
            type={task.action}
            events={task.events}
            source={task.source}
            onEnd={() => onEnd(task)}
        >
            {task.child}
        </TransitionPresence>
    )
}

function createTransitionRender(task: TransitionTask, key: string, onEnd: TransitionTaskEnd) {
    return (
        <TransitionRender
            key={key}
            id={task.id}
            onEnd={() => onEnd(task)}
        >
            {task.child}
        </TransitionRender>
    )
}

export function createTransitionStateFrom(spec: {
    state: TransitionState,
    children: TransitionChildren,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    source: TransitionPresenceEventSource,
    exchangeMode: TransitionMode,
    animateInitial: boolean,
}) {
    const {
        state,
        children: newChildren,
        observers,
        enter,
        exit,
        source,
        exchangeMode,
        animateInitial,
    } = spec
    const oldChildren = state.children
    const isInitialRender = state.initial
    const oldChild = onlyChild(oldChildren)
    const newChild = onlyChild(newChildren)

    function enqueue(items: Array<TransitionMacroTask>) {
        return {...state, queue: [...state.queue, ...items]}
    }

    if (! isValidChild(oldChild) && ! isValidChild(newChild)) {
        // We have nothing to do.
        return
    }

    if (! isValidChild(oldChild) && isValidChild(newChild)) {
        // The child has been passed; we must mount it.
        return enqueue(createMountTasks({newChild, observers, enter, source, initial: animateInitial, isInitialRender}))
    }

    if (isValidChild(oldChild) && ! isValidChild(newChild)) {
        // The child has been removed; we must unmount it (previous child).
        return enqueue(createUnmountTasks({oldChild, observers, exit, source}))
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous child and mount the new one.
        return enqueue(createExchangeTasks({mode: exchangeMode, oldChild, newChild, observers, exit, enter, source}))
    }

    if (isValidChild(oldChild) && isValidChild(newChild)) {
        // The child has been update; we must propagate the update.
        const forceUpdateNeeded = updateTasks(state.queue, state.task, newChild, observers)

        if (forceUpdateNeeded) {
            return {...state}
        }
    }

    return // Makes TypeScript happy.
}

function createTasksTransaction(...tasksList: Array<TransitionMacroTask>) {
    const tid = id()

    for (const tasks of tasksList) {
        for (const task of tasks) {
            task.tid = tid
        }
    }

    return tasksList
}

function createTask(
    action: TransitionTaskAction,
    child: TransitionElement,
    observers: TransitionObservers,
    options?: Partial<TransitionTask>,
): TransitionTask
{
    return {
        // Defaults.
        events: 0,
        target: false,
        flags: [],
        completed: false,
        source: [],
        // Options.
        ...options,
        // Mandatory not overwrite-able.
        id: id(),
        tid: -1,
        action,
        child,
        observers,
    }
}

export function createMountTasks(spec: {
    newChild: TransitionElement,
    observers: TransitionObservers,
    enter: number,
    source: TransitionPresenceEventSource,
    initial: boolean,
    isInitialRender: boolean,
}) {
    const {
        newChild,
        observers,
        enter,
        source,
        initial,
        isInitialRender,
    } = spec
    // We skip the initial render if:
    const skipInitialAnimation =
        // ...it is the initial render...
        isInitialRender
        // ...and we have not been requested to animate the initial render.
        && ! initial
    const action = skipInitialAnimation
        ? 'render'
        : 'mount'
    const events = skipInitialAnimation
        ? 0
        : enter

    return createTasksTransaction([
        createTask(action, newChild, observers, {
            events,
            source,
            target: true,
            flags: ['enter'],
        })
    ])
}

export function createUnmountTasks(spec: {
    oldChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    source: TransitionPresenceEventSource,
}) {
    const {
        oldChild,
        observers,
        exit,
        source,
    } = spec

    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, source, target: true})],
        [createTask('render', <Fragment/>, observers, {flags: ['exit']})],
    )
}

export function createExchangeTasks(spec: {
    mode: TransitionMode,
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    source: TransitionPresenceEventSource,
}) {
    const {
        mode,
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        source,
    } = spec

    // The child has changed; we must unmount previous child and mount the new one.
    switch (mode) {
        case 'cross':
            return createCrossTasks({oldChild, newChild, observers, exit, enter, source})
        break
        case 'out-in':
            // Unmount then mount.
            return createOutInTasks({oldChild, newChild, observers, exit, enter, source})
        break
        case 'in-out':
            // Mount then unmount.
            return createInOutTasks({oldChild, newChild, observers, exit, enter, source})
        break
    }
}

export function createCrossTasks(spec: {
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    source: TransitionPresenceEventSource,
}) {
    const {
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        source,
    } = spec

    return createTasksTransaction(
        [
            // Parallel unmount and mount.
            createTask('unmount', oldChild, observers, {events: exit, source, flags: ['exit']}),
            createTask('mount', newChild, observers, {events: enter, source, target: true, key}),
        ],
        [
            createTask('render', newChild, observers, {target: true, flags: ['enter'], key: (keys) => keys[1]}),
        ],
    )
}

export function createOutInTasks(spec: {
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    source: TransitionPresenceEventSource,
}) {
    const {
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        source,
    } = spec

    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, source, flags: ['exit']})],
        [createTask('mount', newChild, observers, {events: enter, source, target: true, flags: ['enter']})],
    )
}

export function createInOutTasks(spec: {
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    source: TransitionPresenceEventSource,
}) {
    const {
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        source,
    } = spec

    return createTasksTransaction(
        [
            createTask('render', oldChild, observers),
            createTask('mount', newChild, observers, {events: enter, source, target: true, key}),
        ],
        [
            createTask('unmount', oldChild, observers, {events: exit, source, flags: ['exit']}),
            createTask('render', newChild, observers, {target: true}),
        ],
        [
            createTask('render', newChild, observers, {target: true, flags: ['enter'], key: (keys) => keys[1]}),
        ],
    )
}

export function updateTasks(
    queue: TransitionQueue,
    macroTask: TransitionMacroTask | null,
    newChild: TransitionElement,
    observers: TransitionObservers,
) {
    // Current macro task must be the first one (the one with lowest priority).
    const tasksList = [macroTask, ...queue]
    const targetTasks = findTargetTasks(tasksList)
    const hasTargetsTasks = targetTasks.length > 0
    let forceUpdate = false

    for (const it of targetTasks) {
        // We mutate the reference in place. It is safe for queued macro tasks
        // because they are not rendered yet.
        updateTask(it, newChild, observers)
        // But it is not safe for current macro task.
        if (macroTask?.includes(it)) {
            // A target task is inside the current macro task. We need to force the update.
            forceUpdate = true
        }
    }

    if (! hasTargetsTasks) {
        console.warn(
            '@eviljs/std-react/animation.Transition:\n'
            + 'targets tasks can\'t be found.'
        )
    }

    return forceUpdate
}

export function updateTask(task: TransitionTask, child: TransitionElement, observers: TransitionObservers) {
    task.child = child

    if (! task.completed) {
        task.observers = observers
    }

    return task
}

export function consumeQueue(state: TransitionState) {
    if (! macroTaskIsCompleted(state.task)) {
        // Task is in progress. We can't consume.
        return state
    }

    // We pop out the task...
    const [task, ...queue] = state.queue
    // ...storing the pending tasks.

    if (! task) {
        // There is nothing to consume.
        return state
    }

    const keys = task.map((it, idx) =>
        it.key?.(state.keys) // First, we use the task computed key, if any.
        ?? state.keys[idx] // Otherwise we re-use the previous key, if any.
        ?? idx // As last resort, we fallback to the index.
    )

    return {...state, queue, task, keys}
}

export function createTransitionState(): TransitionState {
    return {
        children: null,
        queue: [],
        task: [],
        keys: [],
        initial: true,
    }
}

export function createTransitionPresenceState(id: TransitionTaskId, expectedEvents: number): TransitionPresenceState {
    return {
        id,
        lifecycle: expectedEvents
            ? 'init'
            : 'end' // 0 transitions to the final state.
        ,
        actualEvents: 0,
        expectedEvents: expectedEvents,
    }
}


export function transitionPresenceClasses(type: TransitionTaskAction, lifecycle: TransitionPresenceLifecycle) {
    if (type === 'render') {
        return
    }

    const name = (() => {
        switch (type) {
            case 'unmount':
                return 'exit'
            break
            case 'mount':
                return 'enter'
            break
        }
    })()
    return {
        [`${name}-from`]: lifecycle === 'init',
        [`${name}-to`]: lifecycle === 'active',
    }
}

export function transitionPresenceStyles(type: TransitionTaskAction, lifecycle: TransitionPresenceLifecycle): CSSProperties | undefined {
    switch (type) {
        case 'unmount':
            if (lifecycle === 'end') {
                // return {visibility: 'hidden'} // Glitches on Firefox and Safari.
                return {display: 'none'}
            }
        break
        case 'mount':
            if (lifecycle === 'init') {
                return {display: 'contents', visibility: 'hidden'} // {width: '100vh', height: '100vw'}
            }
        break
    }

    return {display: 'contents'}
}

export function onlyChild(child: TransitionChildren) {
    if (! isArray(child)) {
        return child
    }

    if (child.length !== 1) {
        console.warn(
            '@eviljs/std-react/animation.onlyChild(~~child~~):\n'
            + `child can be undefined | null | boolean | object or an array with one element, given '${child.length}'.`
        )
    }

    return child[0]
}

export function isValidChild(children: TransitionChildren): children is TransitionElement {
    switch (children) {
        case true:
        case false:
        case null:
        case void undefined:
            return false
    }
    if (isString(children)) {
        return false
    }
    return true
}

export function areSameChildren(a?: TransitionElement | null, b?: TransitionElement | null) {
    if (! a && ! b) {
        return true
    }
    if (! a || ! b) {
        return false
    }

    const sameType = a.type === b.type
    const sameKey = a.key === b.key

    return sameType && sameKey
}

export function isValidTransitionPresenceEvent(
    event: TransitionPresenceEvent,
    source: TransitionPresenceEventSource,
) {
    if (source.length === 0) {
        return true
    }

    const target = event.target as HTMLElement

    for (const it of source) {
        const [selectorType] = it

        switch (selectorType) {
            case '.':
            case '#':
                const el = document.querySelector(it)

                if (target === el) {
                    return true
                }
            break
            default:
                if (target.id === it) {
                    return true
                }
                if (target.classList.contains(it)) {
                    return true
                }
            break
        }
    }

    return false
}

export function macroTaskIsCompleted(macroTask: TransitionMacroTask) {
    return macroTask.every(it => it.completed)
}

export function findTargetTasks(queue: Array<TransitionMacroTask | null>) {
    const targets: Array<TransitionTask> = []

    for (const it of queue) {
        const targetTasks = findTargetTasksOf(it)
        targets.push(...targetTasks)
    }

    const lastTargetTask = targets[targets.length - 1] // We select the last inserted task (in time).
    const transactionId = lastTargetTask?.tid
    const transactionTasks = targets.filter(it =>
        // We can't return all targets tasks, but only the target tasks being part
        // of the last transaction.
        it.tid === transactionId
    )

    return transactionTasks
}

export function findTargetTasksOf(task: TransitionMacroTask | null) {
    if (! task) {
        return []
    }

    // There is at most one target per parallel task.
    return task.filter(it => it.target)
}

export function id() {
    return ++Id
}

export function key() {
    return `key-${id()}`
}

// Types ///////////////////////////////////////////////////////////////////////

export type TransitionMode = 'cross' | 'out-in' | 'in-out'
export type TransitionChildren = React.ReactNode
export type TransitionElement = JSX.Element

export interface TransitionObservers {
    onEntered?(): void
    onExited?(): void
    onEnd?(): void
}

export interface TransitionProps extends TransitionObservers {
    children?: TransitionChildren
    enter?: number
    exit?: number
    source?: string | TransitionPresenceEventSource
    initial?: boolean
    mode?: TransitionMode
}

export interface TransitionPresenceProps {
    children: TransitionElement
    id: number
    type: TransitionTaskAction
    events: number
    source: TransitionPresenceEventSource
    onEnd?(): void
}

export interface TransitionRenderProps {
    children: TransitionElement
    id: number
    onEnd?(): void
}

export interface TransitionState {
    children: TransitionChildren
    queue: TransitionQueue
    task: TransitionMacroTask
    keys: Array<string>
    initial: boolean
}

export type TransitionTaskEnd = (task: TransitionTask) => void
export type TransitionTaskId = number
export type TransitionTaskAction = 'unmount' | 'mount' | 'render'
export type TransitionTaskFlag = 'enter' | 'exit'
export type TransitionTaskFlags = Array<TransitionTaskFlag>

export type TransitionQueue = Array<TransitionMacroTask>
export type TransitionMacroTask = Array<TransitionTask>
export interface TransitionTask {
    id: TransitionTaskId
    tid: TransitionTaskId
    action: TransitionTaskAction
    child: TransitionElement
    events: number
    source: TransitionPresenceEventSource
    observers: TransitionObservers
    flags: TransitionTaskFlags
    key?(keys: Array<string>): string
    target: boolean
    completed: boolean
}

export type TransitionPresenceLifecycle =
    | 'init'
    | 'active'
    | 'end'

export interface TransitionPresenceState {
    id: TransitionTaskId
    lifecycle: TransitionPresenceLifecycle
    expectedEvents: number
    actualEvents: number
}

export type TransitionPresenceEventSource = Array<string>

export type TransitionPresenceEvent = React.AnimationEvent<HTMLDivElement> | React.TransitionEvent<HTMLDivElement>
