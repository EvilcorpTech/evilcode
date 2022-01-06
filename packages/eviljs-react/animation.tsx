import {lastOf} from '@eviljs/std/array.js'
import {asArray, isArray, isString, Nil} from '@eviljs/std/type.js'
import {applyStyles} from '@eviljs/web/animation.js'
import {
    Children,
    cloneElement,
    createContext,
    CSSProperties,
    Fragment,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {classes} from './react.js'

export const TransitionContext = createContext<TransitionContext>([])

TransitionContext.displayName = 'TransitionContext'

export let Id = 0

export function Transition(props: TransitionProps) {
    const {children, exit, enter, target, initial, mode, onEntered, onExited, onEnd} = props
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
            target: asArray(target ?? []),
            exchangeMode,
            animateInitial,
        })
        const nextState = consumeQueue({...state, children, queue, initial: false})

        // We derive the state from the props.
        setState(nextState)
    }

    useEffect(() => {
        if (! isMacroTaskCompleted(state.task)) {
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

    const onTaskCompleted = useCallback((completedMicroTask: TransitionTask) => {
        setState(state => {
            const microTask = state.task.find(it => it.id === completedMicroTask.id)

            if (! microTask) {
                console.warn(
                    '@eviljs/react/animation.Transition.onTaskCompleted:\n'
                    + 'missing micro task.'
                )
                return state
            }

            // We mutate the reference in place...
            microTask.completed = true
            // ...so we must force the update.
            return {...state}
        })
    }, [])

    return (
        <Fragment>
            {state.task.map((it, idx) =>
                renderAnimator(it, state.keys[idx]!, onTaskCompleted))
            }
        </Fragment>
    )
}

export function Animator(props: AnimatorProps) {
    const {children, id, type, events, target, onEnd} = props
    const [state, setState] = useState(() => createAnimatorState(id))
    const elRef = useRef<null | HTMLDivElement>(null)
    const collectedEventsRef = useRef(0)
    const {lifecycle} = state

    if (id !== state.id) {
        // We derive the state from the id. Which means that when the task
        // changes, we create a new default state, re-rendering immediately.
        setState(createAnimatorState(id))
    }
    if (events === 0 && state.lifecycle !== 'end') {
        // 0 events transitions immediately to the final state.
        // 'render' tasks have always 0 expected events.
        setState(state => ({...state, lifecycle: 'end'}))
    }

    const context = useMemo((): TransitionContext => {
        switch (type) {
            case 'render': {
                return ['mount', 'entered']
            }
            case 'mount': {
                switch (lifecycle) {
                    case 'init': return ['mount', 'enter']
                    case 'active': return ['mount', 'entering']
                    case 'end': return ['mount', 'entered']
                }
            }
            case 'unmount': {
                switch (lifecycle) {
                    case 'init': return ['unmount', 'exit']
                    case 'active': return ['unmount', 'exiting']
                    case 'end': return ['unmount', 'exited']
                }
            }
        }
    }, [type, lifecycle])

    useEffect(() => {
        collectedEventsRef.current = 0
    }, [id])

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

        setState(state =>
            state.lifecycle === 'init'
                ? {...state, lifecycle: 'active'}
                : state
        )
    }, [id, lifecycle])
    // We need id as dependency because the state can transition from
    // 'end' to 'end' again, when the events are 0.

    useEffect(() => {
        switch (lifecycle) {
            case 'end':
                onEnd?.()
            break
        }
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
            const validEvent = isValidAnimatorEvent(event, target)

            if (! validEvent) {
                return
            }

            collectedEventsRef.current += 1

            if (collectedEventsRef.current < events) {
                return
            }

            setState(state => {
                if (state.lifecycle !== 'active') {
                    return state
                }

                return {...state, lifecycle: 'end'}
            })
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onAnimationEnd, onTransitionEnd}
    }, [id, lifecycle])

    const child = Children.only(children)
    const presenceStyles = presenceAnimationStyles(type, lifecycle)
    const presenceClass = presenceAnimationClasses(type, lifecycle)
    const childProps = {
        ...child.props,
        className: classes(child.props.className, presenceClass),
    }

    return (
        <TransitionContext.Provider value={context}>
            <div
                {...listeners}
                ref={elRef}
                className="Animator-cbb1"
                style={presenceStyles}
            >
                {cloneElement(child, childProps)}
            </div>
        </TransitionContext.Provider>
    )
}

export function useTransitionLifecycle() {
    return useContext(TransitionContext)
}

function renderAnimator(task: TransitionTask, key: string, onEnd: TransitionTaskEnd) {
    return (
        <Animator
            key={key}
            id={task.id}
            type={task.action}
            events={task.events}
            target={task.target}
            onEnd={() => onEnd(task)}
        >
            {task.child}
        </Animator>
    )
}

export function enqueueTask(state: TransitionState, spec: {
    children: TransitionChildren,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    target: AnimatorEventTarget,
    exchangeMode: TransitionMode,
    animateInitial: boolean,
}) {
    const {
        children: newChildren,
        observers,
        enter,
        exit,
        target,
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
        const spec = {newChild, observers, enter, target, initial: animateInitial, isInitialRender}
        return [...state.queue, ...createMountTasks(spec)]
    }

    if (isValidChild(oldChild) && ! isValidChild(newChild)) {
        // The child has been removed; we must unmount it.
        const spec = {oldChild, observers, exit, target}
        return [...state.queue, ...createUnmountTasks(spec)]
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous one and mount the new one.
        const spec = {mode: exchangeMode, oldChild, newChild, observers, exit, enter, target}
        return [...state.queue, ...createExchangeTasks(spec)]
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && areSameChildren(oldChild, newChild)) {
        // The child has been update; we must propagate the update.
        updateTasks(state.queue, state.task, newChild, observers)
        return [...state.queue]
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
        alive: false,
        flags: [],
        completed: false,
        target: [],
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
    target: AnimatorEventTarget,
    initial: boolean,
    isInitialRender: boolean,
}) {
    const {
        newChild,
        observers,
        enter,
        target,
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
        createTask(action, newChild, observers, {events, target, alive: true, flags: ['enter']})
    ])
}

export function createUnmountTasks(spec: {
    oldChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    target: AnimatorEventTarget,
}) {
    const {
        oldChild,
        observers,
        exit,
        target,
    } = spec

    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, target, alive: true})],
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
    target: AnimatorEventTarget,
}) {
    const {
        mode,
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        target,
    } = spec

    switch (mode) {
        case 'cross':
            // We must unmount previous child and mount the new one, in parallel.
            return createCrossTasks({oldChild, newChild, observers, exit, enter, target})
        case 'out-in':
            // We must unmount previous child and mount the new one, in sequence.
            return createOutInTasks({oldChild, newChild, observers, exit, enter, target})
        case 'in-out':
            // We must mount the new child and unmount previous one, in sequence.
            return createInOutTasks({oldChild, newChild, observers, exit, enter, target})
    }
}

export function createCrossTasks(spec: {
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    target: AnimatorEventTarget,
}) {
    const {
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        target,
    } = spec

    return createTasksTransaction(
        [
            // Parallel unmount and mount.
            createTask('unmount', oldChild, observers, {events: exit, target, flags: ['exit']}),
            createTask('mount', newChild, observers, {events: enter, target, alive: true, key: createKey}),
        ],
        [
            createTask('render', newChild, observers, {alive: true, flags: ['enter'], key: (keys) => keys[1]!}),
        ],
    )
}

export function createOutInTasks(spec: {
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    target: AnimatorEventTarget,
}) {
    const {
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        target,
    } = spec

    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, target, flags: ['exit']})],
        [createTask('mount', newChild, observers, {events: enter, target, alive: true, flags: ['enter']})],
    )
}

export function createInOutTasks(spec: {
    oldChild: TransitionElement,
    newChild: TransitionElement,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    target: AnimatorEventTarget,
}) {
    const {
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        target,
    } = spec

    return createTasksTransaction(
        [
            createTask('render', oldChild, observers),
            createTask('mount', newChild, observers, {events: enter, target, alive: true, key: createKey}),
        ],
        [
            createTask('unmount', oldChild, observers, {events: exit, target, flags: ['exit']}),
            createTask('render', newChild, observers, {alive: true}),
        ],
        [
            createTask('render', newChild, observers, {alive: true, flags: ['enter'], key: (keys) => keys[1]!}),
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
    const aliveTasks = findAliveTasks(tasksList)
    const hasAliveTasks = aliveTasks.length > 0
    let forceUpdate = false

    for (const it of aliveTasks) {
        // We mutate the reference in place. It is safe for queued macro tasks
        // because they are not rendered yet.
        updateTask(it, newChild, observers)
        // But it is not safe for current macro task.
        if (macroTask?.includes(it)) {
            // An alive task is inside the current macro task. We need to force the update.
            forceUpdate = true
        }
    }

    if (! hasAliveTasks) {
        console.warn(
            '@eviljs/react/animation.Transition:\n'
            + 'alive tasks can\'t be found.'
        )
    }

    return forceUpdate
}

export function updateTask(task: TransitionTask, child: TransitionElement, observers: TransitionObservers): TransitionTask {
    task.child = child

    if (! task.completed) {
        task.observers = observers
    }

    return task
}

export function consumeQueue(state: TransitionState): TransitionState {
    if (! isMacroTaskCompleted(state.task)) {
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

    return {...state, task, queue, keys}
}

export function createTransitionState(): TransitionState {
    return {
        children: null,
        initial: true,
        keys: [],
        queue: [],
        task: [],
    }
}

export function createAnimatorState(id: TransitionTaskId): AnimatorState {
    return {
        id,
        lifecycle: 'init',
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
            case 'mount':
                return 'enter'
        }
    })()

    return {
        [`${name}-from`]: lifecycle === 'init',
        [`${name}-to`]: lifecycle === 'active',
    }
}

export function presenceAnimationStyles(
    type: TransitionTaskAction,
    lifecycle: AnimatorLifecycle,
): undefined | CSSProperties {
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
                return {display: 'contents', visibility: 'hidden'}
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
    target: AnimatorEventTarget,
) {
    if (target.length === 0) {
        return true
    }

    const eventTarget = event.target as HTMLElement

    for (const it of target) {
        if (eventTarget.id === it) {
            return true
        }
        if (eventTarget.classList.contains(it)) {
            return true
        }
    }
    return false
}

export function isMacroTaskCompleted(macroTask: TransitionMacroTask) {
    return macroTask.every(it => it.completed)
}

export function findAliveTasks(queue: Array<null | TransitionMacroTask>) {
    const aliveTasks = queue
        // There is at most one alive task per parallel macro task.
        .map(macroTask => macroTask?.find(it => it.alive))
        .filter(Boolean) as Array<TransitionTask>

    const lastAliveTask = lastOf(aliveTasks) // We select the last inserted task (in time).
    const aliveTransactionId = lastAliveTask?.tid
    const aliveTransactionTasks = aliveTasks.filter(it =>
        // We can't return all alive tasks, but only those being part
        // of last transaction.
        it.tid === aliveTransactionId
    )

    return aliveTransactionTasks
}

export function createId() {
    return ++Id
}

export function createKey() {
    return `id#${createId()}`
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
    initial?: undefined | boolean
    mode?: undefined | TransitionMode
    target?: undefined | string | AnimatorEventTarget
}

export interface AnimatorProps {
    children: TransitionElement
    events: number
    id: number
    target: AnimatorEventTarget
    type: TransitionTaskAction
    onEnd?(): void
}

export interface TransitionState {
    children: TransitionChildren
    initial: boolean
    keys: Array<string>
    queue: TransitionQueue
    task: TransitionMacroTask
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
    alive: boolean
    child: TransitionElement
    completed: boolean
    events: number
    flags: TransitionTaskFlags
    observers: TransitionObservers
    target: AnimatorEventTarget
    key?(keys: Array<string>): undefined | string
}

export type AnimatorLifecycle =
    | 'init'
    | 'active'
    | 'end'

export interface AnimatorState {
    id: TransitionTaskId
    lifecycle: AnimatorLifecycle
}

export type AnimatorEventTarget = Array<string>

export type AnimatorEvent = React.AnimationEvent<HTMLDivElement> | React.TransitionEvent<HTMLDivElement>

export type TransitionContext =
    | []
    | ['mount', 'enter' | 'entering' | 'entered']
    | ['unmount', 'exit' | 'exiting' | 'exited']
