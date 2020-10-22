import {applyStyles} from '@eviljs/std-web/animation.js'
import {classes} from './react.js'
import React from 'react'
const {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, cloneElement, Fragment} = React

export let Id = 0

export function Transition(props: TransitionProps) {
    const {children, enter, exit, initial, mode, onEntered, onExited, onEnd} = props
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
            ...createTransitionStateFrom(
                state,
                children,
                observers,
                enterEvents,
                exitEvents,
                exchangeMode,
                animateInitial,
            ),
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
    const {children, id, type, events, onEnd} = props
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

        function onAnimated(/* event: AnimationEvent | TransitionEvent */) {
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
    }, [type, lifecycle])

    const presenceStyles = transitionPresenceStyles(type, lifecycle)
    const presenceClass = transitionPresenceClasses(type, lifecycle)
    const className = classes(children.props.className, presenceClass)
    const style = {...children.props.style, ...presenceStyles}
    const childProps = {
        ...children.props,
        className,
        style,
        ...listeners,
    }

    return (
        <div ref={elRef} className="transition-cbb1ec" style={{display: 'contents'}}>
            {cloneElement(children, childProps)}
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

export function createTransitionStateFrom(
    state: TransitionState,
    newChildren: TransitionChildren,
    observers: TransitionObservers,
    enterEvents: number,
    exitEvents: number,
    exchangeMode: TransitionMode,
    animateInitial: boolean,
) {
    const oldChildren = state.children
    const isInitialRender = state.initial

    function enqueue(items: Array<TransitionMacroTask>) {
        return {...state, queue: [...state.queue, ...items]}
    }

    if (! isValidChild(oldChildren) && ! isValidChild(newChildren)) {
        // We have nothing to do.
        return
    }

    if (! isValidChild(oldChildren) && isValidChild(newChildren)) {
        // The child has been passed; we must mount it.
        return enqueue(createMountTasks(newChildren, observers, enterEvents, animateInitial, isInitialRender))
    }

    if (isValidChild(oldChildren) && ! isValidChild(newChildren)) {
        // The child has been removed; we must unmount it (previous child).
        return enqueue(createUnmountTasks(oldChildren, observers, exitEvents))
    }

    if (isValidChild(oldChildren) && isValidChild(newChildren) && ! areSameChildren(oldChildren, newChildren)) {
        // The child has exchanged; we must unmount previous child and mount the new one.
        return enqueue(createExchangeTasks(exchangeMode, oldChildren, newChildren, observers, exitEvents, enterEvents))
    }

    if (isValidChild(oldChildren) && isValidChild(newChildren)) {
        // The child has been update; we must propagate the update.
        const forceUpdateNeeded = updateTasks(state.queue, state.task, newChildren, observers)

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

export function createMountTasks(
    newChild: TransitionElement,
    observers: TransitionObservers,
    enter: number,
    initial: boolean,
    isInitialRender: boolean,
) {
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
            target: true,
            flags: ['enter'],
        })
    ])
}

export function createUnmountTasks(
    oldChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
) {
    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, target: true})],
        [createTask('render', <Fragment/>, observers, {flags: ['exit']})],
    )
}

export function createExchangeTasks(
    mode: TransitionMode,
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
) {
    // The child has changed; we must unmount previous child and mount the new one.
    switch (mode) {
        case 'cross':
            return createCrossTasks(oldChild, newChild, observers, exit, enter)
        break
        case 'out-in':
            // Unmount then mount.
            return createOutInTasks(oldChild, newChild, observers, exit, enter)
        break
        case 'in-out':
            // Mount then unmount.
            return createInOutTasks(oldChild, newChild, observers, exit, enter)
        break
    }
}

export function createCrossTasks(
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
) {
    return createTasksTransaction(
        [
            // Parallel unmount and mount.
            createTask('unmount', oldChild, observers, {events: exit, flags: ['exit']}),
            createTask('mount', newChild, observers, {events: enter, target: true, key}),
        ],
        [
            createTask('render', newChild, observers, {target: true, flags: ['enter'], key: (keys) => keys[1]}),
        ],
    )
}

export function createOutInTasks(
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
) {
    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, flags: ['exit']})],
        [createTask('mount', newChild, observers, {events: enter, target: true, flags: ['enter']})],
    )
}

export function createInOutTasks(
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
) {
    return createTasksTransaction(
        [
            createTask('render', oldChild, observers),
            createTask('mount', newChild, observers, {events: enter, target: true, key}),
        ],
        [
            createTask('unmount', oldChild, observers, {events: exit, flags: ['exit']}),
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

export function transitionPresenceStyles(type: TransitionTaskAction, lifecycle: TransitionPresenceLifecycle) {
    switch (type) {
        case 'unmount':
            if (lifecycle === 'end') {
                // return {visibility: 'hidden'} // Glitches on Firefox and Safari.
                return {display: 'none'}
            }
        break
        case 'mount':
            if (lifecycle === 'init') {
                return {visibility: 'hidden'}
            }
        break
    }

    return // Makes TypeScript happy.
}

export function isValidChild(children: TransitionChildren): children is TransitionElement {
    switch (children) {
        case true:
        case false:
        case null:
        case void undefined:
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

export type TransitionElement = JSX.Element

export type TransitionMode = 'cross' | 'out-in' | 'in-out'

export interface TransitionObservers {
    onEntered?(): void
    onExited?(): void
    onEnd?(): void
}

export interface TransitionProps extends TransitionObservers {
    children?: TransitionChildren
    enter?: number
    exit?: number
    initial?: boolean
    mode?: TransitionMode
}

export interface TransitionPresenceProps {
    children: TransitionElement
    id: number
    type: TransitionTaskAction
    events: number
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
export type TransitionChildren = TransitionElement | boolean | null | undefined
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

export type TransitionPresenceEvent =
    | {type: Exclude<TransitionPresenceEventType, 'init'>}
    | {type: 'init', events: number}

export type TransitionPresenceEventType =
    | 'init'
    | 'event' // Fired when a transition/animation event is received.
    | 'flushed' // Fired when children and styles have been applied to the DOM.
