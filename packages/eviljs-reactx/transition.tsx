import {classes} from '@eviljs/react/classes.js'
import {filterDefined} from '@eviljs/std/array.js'
import {asArray, isArray, isString, Nil} from '@eviljs/std/type.js'
import {applyStyles} from '@eviljs/web/animation.js'
import {
    Children,
    cloneElement,
    createContext,
    CSSProperties,
    Fragment,
    memo,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react'

const NoItems: [] = []

export const TransitionContext = createContext<TransitionContext>({} as any)
TransitionContext.displayName = 'TransitionContext'

export function useTransitionLifecycle() {
    return useContext(TransitionContext)
}

export let TransitionCounter = 0

export function Transition(props: TransitionProps) {
    const {children, exit, enter, target, initial, mode, onEntered, onExited, onEnd} = props
    const [state, dispatch] = useReducer(reduceTransitionState, undefined, createTransitionState)

    if (children !== state.children) {
        // We derive the state from the props.
        dispatch({
            type: 'Updated',
            children, target,
            exit, enter,
            initial, mode,
            onEntered, onExited, onEnd,
        })
    }

    const onTaskEnd = useCallback((taskId: number) => {
        dispatch({type: 'TaskCompleted', taskId})
        dispatch({type: 'ConsumeQueue'})
    }, [])

    useLayoutEffect(() => {
        dispatch({type: 'ConsumeQueue'})
    }, [state.tasks])

    return (
        <Fragment>
            {state.tasks.map((it, idx) =>
                <AnimatorMemo
                    key={it.key}
                    task={it}
                    onEnd={onTaskEnd}
                />
            )}
        </Fragment>
    )
}

const AnimatorMemo = memo(Animator)

export function Animator(props: AnimatorProps) {
    const {task, onEnd} = props
    const animatorRef = useRef<null | HTMLDivElement>(null)
    const [animate, setAnimate] = useState<AnimatorState>({})
    const eventsRef = useRef(0)
    const isAnimating = animate[task.taskId] ?? false
    const lifecycle = computeAnimatorLifecycle({
        action: task.action,
        kind: task.kind,
        animating: isAnimating,
    })

    if (task.action !== 'render' && task.events === 0) {
        console.warn(
            '@eviljs/reactx/transition.Animator:\n'
            + 'a mount/unmount task with 0 events has been provided.'
        )
    }
    if (task.action === 'render' && task.events !== 0) {
        console.warn(
            '@eviljs/reactx/transition.Animator:\n'
            + 'a render task with more than 0 events has been provided.'
        )
    }
    if (task.action === 'render' && ! task.completed) {
        console.warn(
            '@eviljs/reactx/transition.Animator:\n'
            + 'a render task not completed has been provided.'
        )
    }

    useLayoutEffect(() => {
        eventsRef.current = 0

        if (! animatorRef.current) {
            return
        }
        if (isAnimating) {
            // We must force the flush/apply of pending styles and classes
            // only during the initial phase.
            return
        }
        if (task.action === 'render') {
            // A render task has no animation and no styles to apply.
            return
        }

        applyStyles(animatorRef.current)

        // Initial styles and classes have been flushed. Time to fire the animation.

        setAnimate({
            [task.taskId]: true,
        })
    }, [task.taskId])

    const onAnimated = useCallback((event: AnimatorCompletionEvent) => {
        if (! task.target) {
            console.warn(
                '@eviljs/reactx/transition.Animator:\n'
                + 'missing animation event target.',
            )
            return
        }

        const validEvent = isValidAnimatorEvent(event, task.target)

        if (! validEvent) {
            return
        }

        eventsRef.current += 1

        const taskCompleted = eventsRef.current >= task.events

        if (taskCompleted) {
            onEnd?.(task.taskId)
        }
    }, [task.taskId, task.target, task.events])

    const listeners = useMemo(() => {
        if (task.action === 'render') {
            // A render task does not have to wait any animation to complete.
            return
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onAnimationEnd, onTransitionEnd}
    }, [task.action])

    const context = useMemo(() => lifecycle, [lifecycle.action, lifecycle.phase])

    const child = Children.only(task.child)
    const presenceClass = presenceAnimationClasses(task.action, isAnimating)
    const presenceStyles = presenceAnimationStyles(task.action, isAnimating)

    return (
        <TransitionContext.Provider value={context}>
            <div
                {...listeners}
                ref={animatorRef}
                className={classes('Animator-cbb1', presenceClass)}
                style={presenceStyles}
            >
                {cloneElement(child, {
                    ...child.props,
                    className: classes(child.props.className, presenceClass),
                })}
            </div>
        </TransitionContext.Provider>
    )
}

export function createTransitionState(): TransitionState {
    return {
        transitionCounter: ++TransitionCounter,
        transactionCounter: 0,
        taskCounter: 0,
        children: null,
        initial: true,
        queue: [],
        tasks: [],
    }
}

export function reduceTransitionState(
    state: TransitionState,
    event: TransitionEvent,
): TransitionState {
    switch (event.type) {
        case 'Updated': {
            // Component rendered. Let's see what to do with the updated children.
            const tasksAndQueue = reduceTransitionStateUpdate(state, {
                children: event.children,
                observers: {
                    onEntered: event.onEntered,
                    onExited: event.onExited,
                    onEnd: event.onEnd,
                },
                exit: Math.max(0, event.exit ?? 0),
                enter: Math.max(0, event.enter ?? 0),
                target: asArray(event.target ?? NoItems),
                mode: event.mode ?? 'cross',
                initial: event.initial ?? false,
            })

            return {
                ...consumeTransitionStateQueue({...state, ...tasksAndQueue}),
                children: event.children,
                initial: false,
            }
        }

        case 'TaskCompleted': {
            const task = state.tasks.find(it => it.taskId === event.taskId)

            if (! task) {
                // The task is no more in the tasks group. It has been replaced
                // by a new task group from the queue. This is a late
                // notification of React, we must ignore it.
                return state
            }

            if (task.action === 'render') {
                console.warn(
                    '@eviljs/reactx/transition.reduceTransitionState:\n'
                    + 'render tasks should not be notified of completion.'
                )
                return state
            }

            // This mutation must not be reactive. It avoids useless renders.
            task.completed = true

            return state
        }

        case 'ConsumeQueue': {
            if (! areTasksCompleted(state.tasks)) {
                // Tasks group is in progress.
                return state
            }

            // Tasks group is completed.
            const enterTask = state.tasks.find(it => it.kind === 'entered')
            const exitTask = state.tasks.find(it => it.kind === 'exited')

            enterTask?.observers?.onEntered?.()
            exitTask?.observers?.onExited?.()
            enterTask?.observers?.onEnd?.()
            exitTask?.observers?.onEnd?.()

            // Observers have been called. We dispose them, avoiding duplicate calls.
            if (enterTask) {
                enterTask.observers = undefined
            }
            if (exitTask) {
                exitTask.observers = undefined
            }

            return consumeTransitionStateQueue(state)
        }
    }

    return state
}

export function reduceTransitionStateUpdate(state: TransitionState, args: {
    children: TransitionChildren,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    target: TransitionEventTarget,
    mode: TransitionMode,
    initial: boolean,
}): {tasks: TransitionState['tasks'], queue: TransitionState['queue']} {
    const {
        children: newChildren,
        observers,
        enter,
        exit,
        target,
        mode,
        initial,
    } = args
    const oldChildren = state.children
    const initialRender = state.initial
    const oldChild = asOnlyChild(oldChildren)
    const newChild = asOnlyChild(newChildren)

    if (! isValidChild(oldChild) && ! isValidChild(newChild)) {
        // We have nothing to do.
        return state
    }

    if (! isValidChild(oldChild) && isValidChild(newChild)) {
        // The child has been passed; we must mount it.
        const {tasks} = state
        const nextQueue = createMountTasks({state, child: newChild, observers, events: enter, target, initial, initialRender})
        const queue = [...state.queue, ...nextQueue]
        return {tasks, queue}
    }

    if (isValidChild(oldChild) && ! isValidChild(newChild)) {
        // The child has been removed; we must unmount it.
        const {tasks} = state
        const nextQueue = createUnmountTasks({state, child: oldChild, observers, events: exit, target})
        const queue = [...state.queue, ...nextQueue]
        return {tasks, queue}
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous one and mount the new one.
        const {tasks} = state
        const nextQueue = createExchangeTasks({state, mode, oldChild, newChild, observers, enter, exit, target})
        const queue = [...state.queue, ...nextQueue]
        return {tasks, queue}
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && areSameChildren(oldChild, newChild)) {
        // The child has been update; we must propagate the update.
        const {tasks, queue} = state
        return updateTransitionTasks({tasks, queue, child: newChild, observers})
    }

    console.warn(
        '@eviljs/reactx/transition.reduceTransitionStateUpdate:\n'
        + 'unrecognized children case.',
        oldChild,
        newChild,
    )

    return state
}

export function consumeTransitionStateQueue(state: TransitionState): TransitionState {
    if (! areTasksCompleted(state.tasks)) {
        // Task is in progress. We can't consume.
        return state
    }

    // We pop out the tasks group,
    const [nextTasks, ...queue] = state.queue

    if (! nextTasks) {
        // There is nothing to consume.
        return state
    }

    const previousKeys = state.tasks.map(it => it.key)
    const tasks: Array<TransitionSelectedTask> = nextTasks.map(it => ({
        ...it,
        key: undefined
            ?? it.key?.(previousKeys) // We use the task computed key, if any.
            ?? String(it.taskId) // As fallback, we use a unique key.
        ,
        completed: it.action === 'render'
            ? true
            : false
        ,
    }))

    return {...state, tasks, queue}
}

export function updateTransitionTasks(args: {
    tasks: TransitionState['tasks']
    queue: TransitionState['queue']
    child: TransitionElement
    observers: TransitionObservers
}): {tasks: TransitionState['tasks'], queue: TransitionState['queue']} {
    const {tasks, queue, child, observers} = args

    let taskFound = false

    function updateTask<I extends TransitionUpdatableTask>(it: I): I {
        taskFound = true

        return {
            ...it,
            child,
            observers: it.observers
                ? observers
                : undefined
            ,
        }
    }

    const nextTasks = tasks.map(task =>
        areSameChildren(child, task.child)
            ? updateTask(task)
            : task
    )

    const nextQueue = queue.map(tasksGroup =>
        tasksGroup.map(task =>
            areSameChildren(child, task.child)
                ? updateTask(task)
                : task
        )
    )

    if (! taskFound) {
        console.warn(
            '@eviljs/reactx/transition.updateTransitionTasks:\n'
            + 'updatable task not found.'
        )
    }

    return {tasks: nextTasks, queue: nextQueue}
}

export function createTasksTransaction(
    state: TransitionState,
    ...tasks: Array<undefined | Array<TransitionQueuedTask>>
): Array<Array<TransitionQueuedTask>> {
    ++state.transactionCounter

    return tasks.filter(filterDefined)
}

export function createTasksGroup(
    state: TransitionState,
    ...tasks: Array<undefined | TransitionQueuedTask>
): Array<TransitionQueuedTask> {
    return tasks.filter(filterDefined)
}

export function createTask(
    state: TransitionState,
    task: TransitionTaskSpec,
): undefined | TransitionQueuedTask {
    if (task.action !== 'render' && task.events === 0) {
        // mount/unmount tasks with 0 events must be skipped.
        return
    }

    ++state.taskCounter

    const transitionId = state.transitionCounter
    const transactionId = state.transactionCounter
    const taskId = state.taskCounter

    return {
        transitionId,
        transactionId,
        taskId,
        action: task.action,
        child: task.child,
        events: task.action === 'render'
            ? 0
            : task.events
        ,
        target: task.action === 'render'
            ? []
            : task.target
        ,
        kind: task.action === 'render'
            ? task.kind
            : undefined
        ,
        observers: task.action === 'render'
            ? task.observers
            : undefined
        ,
        key: task.key,
    }
}

export function createMountTasks(args: {
    state: TransitionState
    child: TransitionElement
    events: number
    target: TransitionEventTarget
    observers: TransitionObservers
    initial: boolean
    initialRender: boolean
}): TransitionQueue {
    const {
        state,
        child,
        observers,
        events,
        target,
        initial,
        initialRender,
    } = args

    const animated = false
        || (initialRender && initial) // On first render, it is animated only if requested.
        || ! initialRender // After the initial render, it is always animated.

    return createTasksTransaction(state,
        animated
            ? createTasksGroup(state,
                createTask(state, {
                    action: 'mount',
                    child,
                    events,
                    target,
                    key: undefined,
                }),
            )
            : undefined
        ,
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child,
                kind: 'entered',
                observers,
                key: keys => keys[0],
            }),
        ),
    )
}

export function createUnmountTasks(args: {
    state: TransitionState
    child: TransitionElement
    events: number
    target: TransitionEventTarget
    observers: TransitionObservers
}): TransitionQueue {
    const {
        state,
        child,
        observers,
        events,
        target,
    } = args

    return createTasksTransaction(state,
        createTasksGroup(state,
            createTask(state, {
                action: 'unmount',
                child,
                events,
                target,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: <Fragment/>,
                kind: 'exited',
                observers,
                key: keys => keys[0],
            }),
        ),
    )
}

export function createExchangeTasks(args: {
    state: TransitionState
    mode: TransitionMode
    oldChild: TransitionElement
    newChild: TransitionElement
    exit: number
    enter: number
    target: TransitionEventTarget
    observers: TransitionObservers
}): TransitionQueue {
    const {mode, ...otherArgs} = args

    switch (mode) {
        case 'cross':
            // We must unmount previous child and mount the new one, in parallel.
            return createCrossTasks(otherArgs)
        case 'out-in':
            // We must unmount previous child and mount the new one, in sequence.
            return createOutInTasks(otherArgs)
        case 'in-out':
            // We must mount the new child and unmount previous one, in sequence.
            return createInOutTasks(otherArgs)
    }
}

export function createCrossTasks(args: {
    state: TransitionState
    oldChild: TransitionElement
    newChild: TransitionElement
    observers: TransitionObservers
    exit: number
    enter: number
    target: TransitionEventTarget
}): TransitionQueue {
    const {
        state,
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        target,
    } = args

    return createTasksTransaction(state,
        createTasksGroup(state,
            // Parallel unmount and mount.
            createTask(state, {
                action: 'mount',
                child: newChild,
                events: enter,
                target,
                key: undefined,
            }),
            createTask(state, {
                action: 'unmount',
                child: oldChild,
                events: exit,
                target,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'entered',
                observers,
                key: keys => keys[0]!,
            }),
            createTask(state, {
                action: 'render',
                child: <Fragment/>,
                kind: 'exited',
                observers,
                key: keys => keys[1]!,
            }),
        ),
    )
}

export function createOutInTasks(args: {
    state: TransitionState
    oldChild: TransitionElement
    newChild: TransitionElement
    exit: number
    enter: number
    target: TransitionEventTarget
    observers: TransitionObservers
}): TransitionQueue {
    const {
        state,
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        target,
    } = args

    return createTasksTransaction(state,
        createTasksGroup(state,
            createTask(state, {
                action: 'unmount',
                child: oldChild,
                events: exit,
                target,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: <Fragment/>,
                kind: 'exited',
                observers,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'mount',
                child: newChild,
                events: enter,
                target,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'entered',
                observers,
                key: keys => keys[0],
            }),
        ),
    )
}

export function createInOutTasks(args: {
    state: TransitionState
    oldChild: TransitionElement
    newChild: TransitionElement
    exit: number
    enter: number
    target: TransitionEventTarget
    observers: TransitionObservers
}): TransitionQueue {
    const {
        state,
        oldChild,
        newChild,
        observers,
        exit,
        enter,
        target,
    } = args

    ++state.transactionCounter

    return createTasksTransaction(state,
        createTasksGroup(state,
            createTask(state, {
                action: 'mount',
                child: newChild,
                events: enter,
                target,
                key: undefined,
            }),
            createTask(state, {
                action: 'render',
                child: oldChild,
                kind: 'exit',
                observers: undefined,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'entered',
                observers,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'unmount',
                child: oldChild,
                events: exit,
                target,
                key: keys => keys[1],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'entered',
                observers: undefined,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'render',
                child: <Fragment/>,
                kind: 'exited',
                observers,
                key: keys => keys[1],
            }),
        ),
    )
}

export function computeAnimatorLifecycle(args: {
    action: TransitionTaskAction
    kind: undefined | TransitionTaskKind
    animating: boolean
}): TransitionContext {
    const {action, kind, animating} = args

    switch (action) {
        case 'mount':
            return animating
                ? {action: 'mount', phase: 'entering'}
                : {action: 'mount', phase: 'enter'}
        case 'unmount':
            return animating
                ? {action: 'unmount', phase: 'exiting'}
                : {action: 'unmount', phase: 'exit'}
        case 'render':
            switch (kind) {
                case 'enter': return {action: 'mount', phase: 'enter'}
                case 'entered': return {action: 'mount', phase: 'entered'}
                case 'exit': return {action: 'unmount', phase: 'exit'}
                case 'exited': return {action: 'unmount', phase: 'exited'}
            }
    }

    console.warn(
        '@eviljs/reactx/transition.computeAnimatorLifecycle:\n'
        + 'unrecognized lifecycle.'
    )
    return {} as never
}

export function presenceAnimationClasses(action: TransitionTaskAction, animating: boolean) {
    if (action === 'render') {
        return
    }

    const name = (() => {
        switch (action) {
            case 'unmount':
                return 'exit'
            case 'mount':
                return 'enter'
        }
    })()

    return {
        [`${name}-from`]: ! animating,
        [`${name}-to`]: animating,
    }
}

export function presenceAnimationStyles(action: TransitionTaskAction, animating: boolean): undefined | CSSProperties {
    switch (action) {
        case 'mount':
            if (! animating) {
                // The element has just been added to the DOM. We need to
                // hide it during the 'enter-from' phase. It will be revealed
                // during the 'enter-to' phase.
                return {display: 'contents', visibility: 'hidden'}
                // `opacity: 0` does not work with `display: 'contents'`.
                // return {display: 'contents', opacity: 0}
                // return {display: 'none'} // Causes a layout shift.
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
            '@eviljs/reactx/transition.asOnlyChild(~~child~~):\n'
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
    event: AnimatorCompletionEvent,
    target: TransitionEventTarget,
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

export function areTasksCompleted(tasks: Array<TransitionSelectedTask>) {
    // Render tasks are implicitly completed. Mount/unmount tasks must complete.
    return tasks.every(it => it.completed)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TransitionProps extends TransitionObservers {
    children?: undefined | TransitionChildren
    enter?: undefined | number
    exit?: undefined | number
    initial?: undefined | boolean
    mode?: undefined | TransitionMode
    target?: undefined | string | TransitionEventTarget
}

export interface AnimatorProps {
    task: TransitionSelectedTask
    onEnd(taskId: number): void
}

export type TransitionContext =
    | {
        action: 'mount'
        phase: 'enter' | 'entering' | 'entered'
    }
    | {
        action: 'unmount'
        phase: 'exit' | 'exiting' | 'exited'
    }

export interface TransitionState {
    transitionCounter: number
    transactionCounter: number
    taskCounter: number
    children: TransitionChildren
    initial: boolean
    queue: TransitionQueue
    tasks: Array<TransitionSelectedTask>
}

export type TransitionEvent =
    | {
        type: 'Updated'
        children: undefined | TransitionChildren
        enter: undefined | number
        exit: undefined | number
        initial: undefined | boolean
        mode: undefined | TransitionMode
        target: undefined | string | TransitionEventTarget
        onEntered: undefined | (() => void)
        onExited: undefined | (() => void)
        onEnd: undefined | (() => void)
    }
    | {
        type: 'TaskCompleted'
        taskId: number
    }
    | {
        type: 'ConsumeQueue'
    }

export type AnimatorState = Record<number, undefined | true>

export type TransitionMode = 'cross' | 'out-in' | 'in-out'
export type TransitionChildren = undefined | null | boolean | React.ReactChild | React.ReactPortal
export type TransitionQueue = Array<Array<TransitionQueuedTask>>

export interface TransitionObservers {
    onEntered?: undefined | (() => void)
    onExited?: undefined | (() => void)
    onEnd?: undefined | (() => void)
}

export type TransitionTaskAction = 'mount' | 'unmount' | 'render'
export type TransitionTaskKind = 'enter' | 'entered' | 'exit' | 'exited'

export type TransitionTaskSpec =
    | {
        action: 'mount' | 'unmount'
        child: TransitionElement
        events: number
        target: TransitionEventTarget
        kind?: never
        observers?: never
        key: undefined | TransitionKeyComputer
    }
    | {
        action: 'render'
        child: TransitionElement
        events?: never
        target?: never
        kind: TransitionTaskKind
        observers: undefined | TransitionObservers
        key: undefined | TransitionKeyComputer
    }

export interface TransitionTask<K> {
    transitionId: number
    transactionId: number
    taskId: number
    action: 'mount' | 'unmount' | 'render'
    child: TransitionElement
    events: number
    target: TransitionEventTarget
    kind: undefined | TransitionTaskKind
    observers: undefined | TransitionObservers
    key: K
}

export type TransitionQueuedTask = TransitionTask<undefined | TransitionKeyComputer>
export type TransitionSelectedTask = TransitionTask<string> & {
    completed: boolean
}

export type TransitionUpdatableTask = {
    transactionId: number
    child: TransitionElement
    observers?: undefined | TransitionObservers
}

export type TransitionElement = JSX.Element
export type TransitionEventTarget = Array<string>

export interface TransitionKeyComputer {
    (keys: Array<string>): undefined | string
}

export type AnimatorCompletionEvent = React.AnimationEvent<HTMLElement> | React.TransitionEvent<HTMLElement>
