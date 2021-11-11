import {asArray, isArray, isString, Nil} from '@eviljs/std/type.js'
import {applyStyles} from '@eviljs/web/animation.js'
import {Children, cloneElement, CSSProperties, Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {classes} from './react.js'

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
        const queue = enqueueTask(state, {
            children,
            observers,
            exit: exitEvents,
            enter: enterEvents,
            source: asArray(source ?? []),
            exchangeMode,
            animateInitial,
        })
        const nextState = consumeQueue({...state, children, initial: false, queue})

        // We derive the state from the props.
        setState(nextState)
    }

    useEffect(() => {
        if (! macroTaskIsCompleted(state.task)) {
            // Macro task is in progress.
            return
        }

        // Macro task is completed.
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
                    '@eviljs/react/animation.Transition.onTaskCompleted:\n'
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
                renderTask(it, state.keys[idx]!, onMountEnd, onUnmountEnd))
            }
        </Fragment>
    )
}

export function Animator(props: AnimatorProps) {
    const {children, id, type, events, source, onEnd} = props
    const [state, setState] = useState(() => createAnimatorState(id, events))
    const elRef = useRef<null | HTMLDivElement>(null)
    const {lifecycle} = state

    if (id !== state.id) {
        // We derive the state from the id. Which means that when the task is
        // changes, we create a new default state, re-rendering immediately.
        setState(createAnimatorState(id, events))
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
    // We need id as dependency because the state can transition from
    // 'end' to 'end' again, when the events are 0.

    const listeners = useMemo(() => {
        if (type === 'render') {
            return
        }

        if (lifecycle === 'end') {
            return
        }

        function onAnimated(event: AnimatorEvent) {
            const isValidEvent = isValidAnimatorEvent(event, source)

            if (! isValidEvent) {
                return
            }

            setState((state) => {
                if (state.lifecycle !== 'active') {
                    return state
                }

                const collectedEvents = state.collectedEvents + 1

                return {
                    ...state,
                    lifecycle: (collectedEvents < state.expectedEvents)
                        ? 'active'
                        : 'end'
                    ,
                    collectedEvents,
                } as const
            })
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onTransitionEnd, onAnimationEnd}
    }, [id, type, lifecycle])

    const child = Children.only(children)
    const presenceStyles = presenceAnimationStyles(type, lifecycle)
    const presenceClass = presenceAnimationClasses(type, lifecycle)
    const childProps = {
        ...child.props,
        className: classes(child.props.className, presenceClass),
    }

    return (
        <div
            {...listeners}
            ref={elRef}
            className={classes('transition-cbb1ec')}
            style={presenceStyles}
        >
            {cloneElement(child, childProps)}
        </div>
    )
}

export function Render(props: RenderProps) {
    const {children, id, onEnd} = props

    useEffect(() => {
        onEnd?.()
    }, [id])

    return children
}

function renderTask(task: TransitionTask, key: string, onMounted: TransitionTaskEnd, onUnmounted: TransitionTaskEnd) {
    switch (task.action) {
        case 'unmount':
            return createAnimator(task, key, onUnmounted)
        case 'mount':
            return createAnimator(task, key, onMounted)
        case 'render':
            // return createRender(task, key, onMounted)
            return createAnimator(task, key, onMounted)
    }
}

function createAnimator(task: TransitionTask, key: string, onEnd: TransitionTaskEnd) {
    return (
        <Animator
            key={key}
            id={task.id}
            type={task.action}
            events={task.events}
            source={task.source}
            onEnd={() => onEnd(task)}
        >
            {task.child}
        </Animator>
    )
}

function createRender(task: TransitionTask, key: string, onEnd: TransitionTaskEnd) {
    return (
        <Render
            key={key}
            id={task.id}
            onEnd={() => onEnd(task)}
        >
            {task.child}
        </Render>
    )
}

export function enqueueTask(state: TransitionState, spec: {
    children: TransitionChildren,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    source: AnimatorEventSource,
    exchangeMode: TransitionMode,
    animateInitial: boolean,
}) {
    const {
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
    const oldChild = asOnlyChild(oldChildren)
    const newChild = asOnlyChild(newChildren)

    if (! isValidChild(oldChild) && ! isValidChild(newChild)) {
        // We have nothing to do.
        return state.queue
    }

    if (! isValidChild(oldChild) && isValidChild(newChild)) {
        // The child has been passed; we must mount it.
        const spec = {newChild, observers, enter, source, initial: animateInitial, isInitialRender}
        return [...state.queue, ...createMountTasks(spec)]
    }

    if (isValidChild(oldChild) && ! isValidChild(newChild)) {
        // The child has been removed; we must unmount it.
        const spec = {oldChild, observers, exit, source}
        return [...state.queue, ...createUnmountTasks(spec)]
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous one and mount the new one.
        const spec = {mode: exchangeMode, oldChild, newChild, observers, exit, enter, source}
        return [...state.queue, ...createExchangeTasks(spec)]
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && areSameChildren(oldChild, newChild)) {
        // The child has been update; we must propagate the update.
        updateTasks(state.queue, state.task, newChild, observers)
        return state.queue
    }

    return state.queue
}

function createTasksTransaction(...tasksList: Array<TransitionMacroTask>) {
    const tid = createId()

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
    options?: undefined | Partial<TransitionTask>,
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
        id: createId(),
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
    source: AnimatorEventSource,
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
    const skipInitialAnimation = true // We skip the initial render if...
        && isInitialRender // ...it is the initial render...
        && ! initial // ...and we don't have to animate the initial render.
    const action = skipInitialAnimation
        ? 'render'
        : 'mount'
    const events = skipInitialAnimation
        ? 0 // Because we don't animate, we have no event to wait for.
        : enter

    return createTasksTransaction([
        createTask(action, newChild, observers, {events, source, target: true, flags: ['enter']})
    ])
}

export function createUnmountTasks(spec: {
    oldChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    source: AnimatorEventSource,
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
    source: AnimatorEventSource,
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

    switch (mode) {
        case 'cross':
            // We must unmount previous child and mount the new one, in parallel.
            return createCrossTasks({oldChild, newChild, observers, exit, enter, source})
        break
        case 'out-in':
            // We must unmount previous child and mount the new one, in sequence.
            return createOutInTasks({oldChild, newChild, observers, exit, enter, source})
        break
        case 'in-out':
            // We must mount the new child and unmount previous one, in sequence.
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
    source: AnimatorEventSource,
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
            createTask('mount', newChild, observers, {events: enter, source, target: true, key: createKey}),
        ],
        [
            createTask('render', newChild, observers, {target: true, flags: ['enter'], key: (keys) => keys[1]!}),
        ],
    )
}

export function createOutInTasks(spec: {
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    source: AnimatorEventSource,
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
    source: AnimatorEventSource,
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
            createTask('mount', newChild, observers, {events: enter, source, target: true, key: createKey}),
        ],
        [
            createTask('unmount', oldChild, observers, {events: exit, source, flags: ['exit']}),
            createTask('render', newChild, observers, {target: true}),
        ],
        [
            createTask('render', newChild, observers, {target: true, flags: ['enter'], key: (keys) => keys[1]!}),
        ],
    )
}

export function updateTasks(
    queue: TransitionQueue,
    macroTask: null | TransitionMacroTask,
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
            '@eviljs/react/animation.Transition:\n'
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
    // ...obtaining the pending tasks.

    if (! task) {
        // There is nothing to consume.
        return state
    }

    const keys = task.map((it, idx) =>
        it.key?.(state.keys) // First, we use the task computed key, if any.
        ?? state.keys[idx] // Otherwise we re-use the previous key, if any.
        ?? String(idx) // As last resort, we fallback to the index.
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

export function createAnimatorState(id: TransitionTaskId, expectedEvents: number): AnimatorState {
    return {
        id,
        lifecycle: expectedEvents
            ? 'init'
            : 'end' // 0 transitions to the final state.
        ,
        collectedEvents: 0,
        expectedEvents: expectedEvents,
    }
}


export function presenceAnimationClasses(type: TransitionTaskAction, lifecycle: AnimatorLifecycle) {
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

export function presenceAnimationStyles(type: TransitionTaskAction, lifecycle: AnimatorLifecycle): CSSProperties | undefined {
    switch (type) {
        case 'unmount':
            if (lifecycle === 'end') {
                // return {display: 'none'} // Causes a layout shift.
                // return {visibility: 'hidden'} // Glitches on Firefox and Safari.
                return {opacity: 0}
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

export function asOnlyChild(child: TransitionChildren | Array<TransitionChildren>): TransitionChildren {
    if (! isArray(child)) {
        return child
    }

    if (child.length !== 1) {
        console.warn(
            '@eviljs/react/animation.asOnlyChild(~~child~~):\n'
            + `child can be Nil | boolean | object or an array with one element, given '${child.length}'.`
        )
    }

    const onlyChild = child[0]

    return asOnlyChild(onlyChild)
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

export function areSameChildren(a?: Nil | TransitionElement, b?: Nil | TransitionElement) {
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

export function isValidAnimatorEvent(
    event: AnimatorEvent,
    source: AnimatorEventSource,
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

export function findTargetTasks(queue: Array<null | TransitionMacroTask>) {
    const targets: Array<TransitionTask> = []

    for (const it of queue) {
        const targetTasks = findTargetTasksOf(it)
        targets.push(...targetTasks)
    }

    const lastTargetTask = targets[targets.length - 1] // We select the last inserted task (in time).
    const transactionId = lastTargetTask?.tid
    const transactionTasks = targets.filter(it =>
        // We can't return all targets tasks, but only those being part
        // of the last transaction.
        it.tid === transactionId
    )

    return transactionTasks
}

export function findTargetTasksOf(task: null | TransitionMacroTask) {
    if (! task) {
        return []
    }

    // There is at most one target per parallel task.
    return task.filter(it => it.target)
}

export function createId() {
    return ++Id
}

export function createKey() {
    return `key-${createId()}`
}

// Types ///////////////////////////////////////////////////////////////////////

export type TransitionMode = 'cross' | 'out-in' | 'in-out'
export type TransitionChildren = undefined | null | boolean | React.ReactChild | React.ReactPortal
export type TransitionElement = JSX.Element

export interface TransitionObservers {
    onEntered?(): void
    onExited?(): void
    onEnd?(): void
}

export interface TransitionProps extends TransitionObservers {
    children?: undefined | TransitionChildren
    enter?: undefined | number
    exit?: undefined | number
    source?: undefined | string | AnimatorEventSource
    initial?: undefined | boolean
    mode?: undefined | TransitionMode
}

export interface AnimatorProps {
    children: TransitionElement
    id: number
    type: TransitionTaskAction
    events: number
    source: AnimatorEventSource
    onEnd?(): void
}

export interface RenderProps {
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
    source: AnimatorEventSource
    observers: TransitionObservers
    flags: TransitionTaskFlags
    key?(keys: Array<string>): undefined | string
    target: boolean
    completed: boolean
}

export type AnimatorLifecycle =
    | 'init'
    | 'active'
    | 'end'

export interface AnimatorState {
    id: TransitionTaskId
    lifecycle: AnimatorLifecycle
    expectedEvents: number
    collectedEvents: number
}

export type AnimatorEventSource = Array<string>

export type AnimatorEvent = React.AnimationEvent<HTMLDivElement> | React.TransitionEvent<HTMLDivElement>
