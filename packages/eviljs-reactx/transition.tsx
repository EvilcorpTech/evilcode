import {classes} from '@eviljs/react/classes.js'
import {defineContext} from '@eviljs/react/ctx.js'
import {asArray, isArray, isNotNil, isString, Nil} from '@eviljs/std/type.js'
import {requestStylesFlush} from '@eviljs/web/animation.js'
import {
    Children,
    cloneElement,
    Fragment,
    memo,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react'

const NoItems: [] = []

export const TransitionContext = defineContext<TransitionContext>('TransitionContext')

export const TransitionTimeoutDefault = 1_500

export function useTransitionLifecycle() {
    return useContext(TransitionContext)
}

export function Transition(props: TransitionProps) {
    const {
        children,
        className, classPrefix,
        enter, exit, target, timeout,
        initial, mode,
        onEnd, onEntered, onExited,
    } = props
    const [state, dispatch] = useReducer(reduceTransitionState, undefined, createTransitionState)

    if (children !== state.children) {
        // We derive the state from the props.
        dispatch({
            type: 'ChildrenChanged',
            children,
            initial, mode,
            onEntered, onExited, onEnd,
        })
    }

    const onTaskEnd = useCallback((task: TransitionTaskSelected) => {
        dispatch({type: 'TaskCompleted', taskId: task.taskId})
    }, [])

    useLayoutEffect(() => {
        dispatch({type: 'TasksChanged'})
    }, [state.tasks, state.queue])

    return (
        <Fragment>
            {state.tasks.map((it, idx) =>
                <AnimatorMemo
                    key={it.key}
                    task={it}
                    className={className} classPrefix={classPrefix}
                    enter={enter} exit={exit} target={target} timeout={timeout}
                    onEnd={onTaskEnd}
                />
            )}
        </Fragment>
    )
}

const AnimatorMemo = memo(Animator)

export function Animator(props: AnimatorProps) {
    const {className, classPrefix, target, timeout, task, onEnd} = props
    const handleRef = useRef<null | HTMLTemplateElement>(null)
    const [animate, setAnimate] = useState<AnimatorState>({})
    const eventsRef = useRef(0)
    const taskAnimating = animate[task.taskId] ?? false
    const lifecycle = computeAnimatorLifecycle(task.action, task.kind, taskAnimating)

    const taskEvents = (() => {
        switch (task.kind) {
            case 'enter':
                return Math.max(0, props.enter ?? 1)
            case 'exit':
                return Math.max(0, props.exit ?? 1)
        }
        return 0
    })()

    const onTaskEnd = useCallback(() => {
        task.observers?.onEntered?.()
        task.observers?.onExited?.()
        task.observers?.onEnd?.()
        task.observers = undefined // We dispose the observers, avoiding duplicate calls.

        onEnd?.(task)
    }, [
        task.taskId,
        task.observers?.onEntered,
        task.observers?.onExited,
        task.observers?.onEnd,
        onEnd,
    ])

    const onAnimated = useCallback((event: AnimatorCompletionEvent) => {
        if (eventsRef.current >= taskEvents) {
            // The task completed. We skip additional notifications.
            return
        }

        const validEvent = isValidAnimatorEvent(event, target)

        if (! validEvent) {
            return
        }

        eventsRef.current += 1

        if (eventsRef.current < taskEvents) {
            return
        }

        onTaskEnd()
    }, [target, taskEvents, onTaskEnd])

    const listeners = useMemo((): undefined | AnimatorAnimatableEvents => {
        if (task.action === 'render') {
            // A render task has no animation. We can skip it.
            return
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onAnimationEnd, onTransitionEnd}
    }, [task.action, onAnimated])

    const contextValue = useMemo(() => {
        return lifecycle
    }, [lifecycle.action, lifecycle.phase])

    useEffect(() => {
        eventsRef.current = 0

        if (task.action === 'render') {
            // A render task has no animation and no styles to apply.
            return
        }

        const animatorElement = findHandleTarget(handleRef.current)

        if (! animatorElement) {
            return
        }
        if (taskAnimating) {
            // We must force the flush of pending styles and classes
            // only during the initial phase (when not animating).
            return
        }

        requestStylesFlush(animatorElement as HTMLElement).then(() => {
            // Initial styles and classes have been flushed. Time to fire the animation.

            setAnimate({
                [task.taskId]: true,
            })
        })
    }, [task.taskId])

    useEffect(() => {
        if (task.action === 'render') {
            // A render task has no animation to wait for.
            return
        }
        if (! taskAnimating) {
            return
        }

        const timeoutId = setTimeout(() => {
            console.warn(
                '@eviljs/reactx/transition.Animator:\n'
                + `transition timeout detected during '${task.action}'.`
            )

            onTaskEnd()
        }, timeout ?? TransitionTimeoutDefault)

        function onClean() {
            clearTimeout(timeoutId)
        }

        return onClean
    }, [task.action, taskAnimating, onTaskEnd])

    const child = Children.only(task.child)
    const presenceClass = undefined
        ?? className?.(task.action, task.kind, taskAnimating)
        ?? presenceAnimationClasses(task.action, task.kind, taskAnimating, classPrefix)
    const presenceStyles = presenceAnimationStyles(task.action, task.kind, taskAnimating)

    return (
        <TransitionContext.Provider value={contextValue}>
            {cloneElement(child, {
                className: classes(child.props.className, presenceClass),
                style: {...child.props.styles, ...presenceStyles},
                ...listeners,
            })}
            {task.action !== 'render' &&
                <template ref={handleRef} style={{display: 'none'}}/>
            }
        </TransitionContext.Provider>
    )
}

export function createTransitionState(): TransitionState {
    return {
        transitionCounter: 0,
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
        case 'ChildrenChanged': {
            // Children prop changed. Let's see what to do with the updated children.
            return reduceTransitionChildrenChange(state, {
                children: event.children,
                observers: {
                    onEntered: event.onEntered,
                    onExited: event.onExited,
                    onEnd: event.onEnd,
                },
                mode: event.mode ?? 'cross',
                initial: event.initial ?? false,
            })
        }

        case 'TaskCompleted': {
            return reduceTransitionQueue({
                ...state,
                tasks: state.tasks.map(it => {
                    if (it.taskId !== event.taskId) {
                        return it
                    }

                    if (it.action === 'render') {
                        console.warn(
                            '@eviljs/reactx/transition.reduceTransitionState(TaskCompleted):\n'
                            + 'render tasks should not be notified of completion.'
                        )
                    }

                    return {...it, completed: true}
                }),
            })
        }

        case 'TasksChanged': {
            return reduceTransitionQueue(state)
        }
    }

    return state
}

export function reduceTransitionChildrenAfter(state: TransitionState, children: TransitionChildren): TransitionState {
    return {...state, initial: false, children}
}

export function reduceTransitionChildrenChange(state: TransitionState, args: {
    children: TransitionChildren,
    observers: TransitionObservers,
    mode: TransitionMode,
    initial: boolean,
}): TransitionState {
    const {observers, mode, initial} = args
    const initialRender = state.initial
    const newChildren = args.children
    const oldChildren = state.children
    const oldChild = asOnlyChild(oldChildren)
    const newChild = asOnlyChild(newChildren)
    const oldChildValid = isValidChild(oldChild)
    const newChildValid = isValidChild(newChild)
    const reduceUpdate = reduceTransitionChildrenAfter

    if (! oldChildValid && ! newChildValid) {
        // We have no animation to do.
        return reduceUpdate(state, newChildren)
    }

    if (! oldChildValid && newChildValid) {
        // The child has been passed; we must mount it.
        const queuedTasks = createMountTasks({state, child: newChild, observers, initial, initialRender})
        const queue = [...state.queue, ...queuedTasks]
        return reduceUpdate({...state, queue}, newChildren)
    }

    if (oldChildValid && ! newChildValid) {
        // The child has been removed; we must unmount it.
        const queuedTasks = createUnmountTasks({state, child: oldChild, observers})
        const queue = [...state.queue, ...queuedTasks]
        return reduceUpdate({...state, queue}, newChildren)
    }

    if (oldChildValid && newChildValid && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous one and mount the new one.
        const queuedTasks = createExchangeTasks({state, mode, oldChild, newChild, observers})
        const queue = [...state.queue, ...queuedTasks]
        return reduceUpdate({...state, queue}, newChildren)
    }

    if (oldChildValid && newChildValid && areSameChildren(oldChild, newChild)) {
        // The child has been update; we must propagate the update.
        return reduceUpdate(reduceTransitionChildUpdate(state, {child: newChild, observers}), newChildren)
    }

    console.warn(
        '@eviljs/reactx/transition.reduceTransitionChildrenChange:\n'
        + 'unrecognized children condition.',
        oldChild, newChild,
    )

    return reduceUpdate(state, newChildren)
}

export function reduceTransitionChildUpdate(state: TransitionState, args: {
    child: TransitionElement
    observers: TransitionObservers
}): TransitionState {
    const {child} = args

    let taskFound = false

    function updateTask<I extends TransitionTaskSelected | TransitionTaskQueued>(it: I): I {
        taskFound = true

        return {
            ...it,
            child,
            observers: it.observers
                ? filterTaskObservers(it.action, args.observers) // Observers have not been disposed. We can update.
                : undefined // Observers have been disposed. We can't update.
            ,
        }
    }

    const nextState: TransitionState = {
        ...state,
        children: child,
        tasks: state.tasks.map(task =>
            areSameChildren(child, task.child)
                ? updateTask(task)
                : task
        ),
        queue: state.queue.map(tasksGroup =>
            tasksGroup.map(task =>
                areSameChildren(child, task.child)
                    ? updateTask(task)
                    : task
            )
        ),
    }

    if (! taskFound) {
        console.warn(
            '@eviljs/reactx/transition.reduceTransitionChildUpdate:\n'
            + 'updatable task not found.'
        )
        return {...state, children: child}
    }

    return nextState
}

export function reduceTransitionQueue(state: TransitionState): TransitionState {
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
    const tasks = nextTasks.map(it => createSelectedTask(it, previousKeys))

    return {...state, tasks, queue}
}

export function createSelectedTask(task: TransitionTaskQueued, keys: Array<string>): TransitionTaskSelected {
    return {
        ...task,
        key: undefined
            ?? task.key?.(keys) // We use the task computed key, if any.
            ?? String(task.taskId) // As fallback, we use a unique key.
        ,
        completed: task.action === 'render'
            ? true
            : false
        ,
    }
}

export function createTasksTransaction(
    state: TransitionState,
    ...tasks: Array<undefined | Array<TransitionTaskQueued>>
): Array<Array<TransitionTaskQueued>> {
    ++state.transactionCounter

    return tasks.filter(isNotNil)
}

export function createTasksGroup(
    state: TransitionState,
    ...tasks: Array<undefined | TransitionTaskQueued>
): Array<TransitionTaskQueued> {
    return tasks.filter(isNotNil)
}

export function createTask(
    state: TransitionState,
    task: TransitionTaskSpec,
): undefined | TransitionTaskQueued {
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
        kind: task.kind,
        observers: filterTaskObservers(task.action, task.observers),
        key: task.key,
    }
}

export function createMountTasks(args: {
    state: TransitionState
    child: TransitionElement
    observers: TransitionObservers
    initial: boolean
    initialRender: boolean
}): TransitionTasksQueue {
    const {state, child, observers, initial, initialRender} = args

    const animated = initialRender
        ? initial // On initial render, it is animated only if requested.
        : true // After the initial render, it is always animated.

    return createTasksTransaction(state,
        animated
            ? createTasksGroup(state,
                createTask(state, {
                    action: 'mount',
                    child,
                    kind: 'enter',
                    observers,
                    key: undefined,
                }),
            )
            : undefined
        ,
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child,
                kind: 'enter',
                observers: undefined,
                key: keys => keys[0],
            }),
        ),
    )
}

export function createUnmountTasks(args: {
    state: TransitionState
    child: TransitionElement
    observers: TransitionObservers
}): TransitionTasksQueue {
    const {state, child, observers} = args

    return createTasksTransaction(state,
        createTasksGroup(state,
            createTask(state, {
                action: 'unmount',
                child,
                kind: 'exit',
                observers,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: <Fragment/>,
                kind: 'exit',
                observers: undefined,
                key: undefined,
            }),
        ),
    )
}

export function createExchangeTasks(args: {
    state: TransitionState
    mode: TransitionMode
    oldChild: TransitionElement
    newChild: TransitionElement
    observers: TransitionObservers
}): TransitionTasksQueue {
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
}): TransitionTasksQueue {
    const {
        state,
        oldChild,
        newChild,
        observers,
    } = args

    return createTasksTransaction(state,
        createTasksGroup(state,
            // Parallel unmount and mount.
            createTask(state, {
                action: 'unmount',
                child: oldChild,
                kind: 'exit',
                observers,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'mount',
                child: newChild,
                kind: 'enter',
                observers,
                key: undefined,
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'enter',
                observers: undefined,
                key: keys => keys[1]!,
            }),
        ),
    )
}

export function createOutInTasks(args: {
    state: TransitionState
    oldChild: TransitionElement
    newChild: TransitionElement
    observers: TransitionObservers
}): TransitionTasksQueue {
    const {state, oldChild, newChild, observers} = args

    return createTasksTransaction(state,
        createTasksGroup(state,
            createTask(state, {
                action: 'unmount',
                child: oldChild,
                kind: 'exit',
                observers,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'mount',
                child: newChild,
                kind: 'enter',
                observers,
                key: undefined,
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'enter',
                observers: undefined,
                key: keys => keys[1],
            }),
        ),
    )
}

export function createInOutTasks(args: {
    state: TransitionState
    oldChild: TransitionElement
    newChild: TransitionElement
    observers: TransitionObservers
}): TransitionTasksQueue {
    const {state, oldChild, newChild, observers} = args

    ++state.transactionCounter

    return createTasksTransaction(state,
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: oldChild,
                kind: 'enter',
                observers: undefined,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'mount',
                child: newChild,
                kind: 'enter',
                observers,
                key: undefined,
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'unmount',
                child: oldChild,
                kind: 'exit',
                observers,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'enter',
                observers: undefined,
                key: keys => keys[1],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
                kind: 'enter',
                observers: undefined,
                key: keys => keys[1],
            }),
        ),
    )
}

export function filterTaskObservers(action: TransitionTaskAction, observers: undefined | TransitionObservers) {
    switch (action) {
        case 'mount':
            return {
                onEntered: observers?.onEntered,
                onEnd: observers?.onEnd,
            }
        case 'unmount':
            return {
                onExited: observers?.onExited,
                onEnd: observers?.onEnd,
            }
        case 'render':
            return
    }
}

export function computeAnimatorLifecycle(
    action: TransitionTaskAction,
    kind: TransitionTaskKind,
    animating: boolean,
): TransitionContext {
    switch (action) {
        case 'mount':
            return {action: 'mount', phase: animating ? 'entering' : 'entered'}
        case 'unmount':
            return {action: 'unmount', phase: animating ? 'exiting' : 'exited'}
        case 'render':
            switch (kind) {
                case 'enter': return {action: 'mount', phase: 'entered'}
                case 'exit': return {action: 'unmount', phase: 'exited'}
            }
    }

    console.warn(
        '@eviljs/reactx/transition.computeAnimatorLifecycle:\n'
        + 'unrecognized lifecycle.'
    )
    return {} as never
}

export function presenceAnimationClasses(
    action: TransitionTaskAction,
    kind: TransitionTaskKind,
    animating: boolean,
    prefix?: undefined | string
) {
    const name = (() => {
        switch (action) {
            case 'unmount':
                return 'exit'
            case 'mount':
                return 'enter'
            case 'render':
                return
            break
        }
        return
    })()

    if (! name) {
        return {}
    }

    return {
        [`${prefix ?? ''}${name}-from`]: ! animating,
        [`${prefix ?? ''}${name}-to`]: animating,
    }
}

export function presenceAnimationStyles(
    action: TransitionTaskAction,
    kind: TransitionTaskKind,
    animating: boolean,
): undefined | React.CSSProperties {
    switch (action) {
        case 'mount':
            if (! animating) {
                // The element has just been added to the DOM. We need to
                // hide it during the 'enter-from' phase. It will be revealed
                // during the 'enter-to' phase.
                return {visibility: 'hidden'}
                // return {opacity: 0} // does not work with display: 'contents'.
                // return {display: 'none'} // Causes a layout shift.
            }
        break
    }
    return
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

export function findHandleTarget(handleElement: undefined | null | HTMLElement) {
    if (! handleElement) {
        return
    }
    return handleElement.previousElementSibling ?? undefined
}

export function isValidAnimatorEvent(
    event: AnimatorCompletionEvent,
    target: TransitionEventTarget,
) {
    const targets = asArray(target ?? NoItems)

    if (targets.length === 0) {
        return true
    }

    const eventTarget = event.target as Partial<HTMLElement>

    for (const it of targets) {
        if (eventTarget.id === it) {
            return true
        }
        if (eventTarget.classList?.contains(it)) {
            return true
        }
    }
    return false
}

export function areTasksCompleted(tasks: TransitionTasksGroupSelected) {
    // Render tasks are implicitly completed. Mount/unmount tasks must complete.
    return tasks.every(it => it.completed)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TransitionProps extends TransitionObservers, TransitionConfig {
    children?: undefined | TransitionChildren
    initial?: undefined | boolean
    mode?: undefined | TransitionMode
}

export interface AnimatorProps extends TransitionConfig {
    task: TransitionTaskSelected
    onEnd(task: TransitionTaskSelected): void
}

export interface TransitionConfig {
    className?: undefined | ((action: TransitionTaskAction, kind: TransitionTaskKind, animating: boolean) => string)
    classPrefix?: undefined | string
    enter?: undefined | number
    exit?: undefined | number
    target?: undefined | TransitionEventTarget
    timeout?: undefined | number
}

export type TransitionContext =
    | {
        action: 'mount'
        phase: 'entering' | 'entered'
    }
    | {
        action: 'unmount'
        phase: 'exiting' | 'exited'
    }

export interface TransitionState {
    transitionCounter: number
    transactionCounter: number
    taskCounter: number
    children: TransitionChildren
    initial: boolean
    queue: TransitionTasksQueue
    tasks: TransitionTasksGroupSelected
}

export type TransitionEvent =
    | {
        type: 'ChildrenChanged'
        children: undefined | TransitionChildren
        initial: undefined | boolean
        mode: undefined | TransitionMode
        onEntered: undefined | (() => void)
        onExited: undefined | (() => void)
        onEnd: undefined | (() => void)
    }
    | {
        type: 'TaskCompleted'
        taskId: number
    }
    | {
        type: 'TasksChanged'
    }

export type AnimatorState = Record<number, undefined | true>

export type TransitionMode = 'cross' | 'out-in' | 'in-out'
export type TransitionChildren = undefined | null | boolean | React.ReactChild | React.ReactPortal

export interface TransitionObservers {
    onEntered?: undefined | (() => void)
    onExited?: undefined | (() => void)
    onEnd?: undefined | (() => void)
}

export type TransitionTaskAction = 'mount' | 'unmount' | 'render'
export type TransitionTaskKind = 'enter' | 'exit'

export type TransitionTaskSpec =
    | {
        action: 'mount' | 'unmount'
        child: TransitionElement
        kind: TransitionTaskKind
        observers: undefined | TransitionObservers
        key: undefined | TransitionKeyComputer
    }
    | {
        action: 'render'
        child: TransitionElement
        kind: TransitionTaskKind
        observers: undefined
        key: undefined | TransitionKeyComputer
    }

export interface TransitionTask<K> {
    transitionId: number
    transactionId: number
    taskId: number
    action: TransitionTaskAction
    child: TransitionElement
    kind: TransitionTaskKind
    observers: undefined | TransitionObservers
    key: K
}

export type TransitionTaskQueued = TransitionTask<undefined | TransitionKeyComputer>
export type TransitionTaskSelected = TransitionTask<string> & {completed: boolean}
export type TransitionTasksGroupQueued = Array<TransitionTaskQueued>
export type TransitionTasksGroupSelected = Array<TransitionTaskSelected>
export type TransitionTasksQueue = Array<TransitionTasksGroupQueued>

export type TransitionElement = JSX.Element
export type TransitionEventTarget = undefined | string | Array<string>

export interface TransitionKeyComputer {
    (keys: Array<string>): undefined | string
}

export interface AnimatorAnimatable extends AnimatorAnimatableProps, AnimatorAnimatableEvents {
}

export interface AnimatorAnimatableProps {
    className?: undefined | string
    style?: undefined | React.CSSProperties
}

export interface AnimatorAnimatableEvents {
    onAnimationEnd?: undefined | ((event: React.AnimationEvent<HTMLElement>) => void)
    onTransitionEnd?: undefined | ((event:  React.TransitionEvent<HTMLElement>) => void)
}

export type AnimatorCompletionEvent = React.AnimationEvent<HTMLElement> | React.TransitionEvent<HTMLElement>
