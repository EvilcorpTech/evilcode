import {asArray, isNotNil, isUndefined} from '@eviljs/std/type.js'
import {requestStylesFlush} from '@eviljs/web/animation.js'
import {
    cloneElement,
    Fragment,
    isValidElement,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react'
import {classes} from './classes.js'
import {defineContext} from './ctx.js'

const NoItems: [] = []
const DisplayNoneStyle: React.CSSProperties = {display: 'none'}

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

    return (
        <>
            {state.tasks.map((it, idx) =>
                <AnimatorMemo
                    key={it.key}
                    task={it}
                    className={className} classPrefix={classPrefix}
                    enter={enter} exit={exit} target={target} timeout={timeout}
                    onEnd={onTaskEnd}
                />
            )}
        </>
    )
}

const AnimatorMemo = memo(Animator)

export function Animator(props: AnimatorProps) {
    const {className, classPrefix, target, timeout, task, onEnd} = props
    const handleRef = useRef<null | HTMLTemplateElement>(null)
    const eventsRef = useRef(0)
    const [tasksLifecycle, setTasksLifecycle] = useState<State>({})

    type State = Record<TransitionTaskId, undefined | AnimatorTaskLifecycle>

    // We use the taskId as indirection of the task state, to be sure that the
    // task state is reset immediately when the taskId changes. Otherwise, using
    // an useEffect/useLayoutEffect, we would have an old/stale state on first render,
    // resulting in wrong context value, wrong classes and wrong styles.
    const taskLifecycle = tasksLifecycle[task.taskId] ?? 'initial'

    const setTaskLifecycle = useCallback((state: AnimatorTaskLifecycle) => {
        setTasksLifecycle({[task.taskId]: state})
    }, [task.taskId])

    const taskEvents = (() => {
        switch (task.action) {
            case 'mount':
                return Math.max(0, props.enter ?? 1)
            case 'unmount':
                return Math.max(0, props.exit ?? 1)
            case 'render':
                // A render task has no animation and no animation event.
                return 0
        }
        return 0
    })()

    if (taskEvents === 0 && taskLifecycle !== 'animated' && task.action !== 'render') {
        // We derive the state. In this way an unmount action with 0 events
        // is reflected immediately (without re-layout, re-paint and flashing).
        setTaskLifecycle('animated')
    }

    const onTaskEnd = useCallback(() => {
        setTaskLifecycle('animated')

        task.observers?.onEntered?.()
        task.observers?.onExited?.()
        task.observers?.onEnd?.()
        task.observers = undefined // We dispose the observers, avoiding duplicate calls.

        onEnd?.(task)
    }, [
        setTaskLifecycle,
        task,
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
    }, [taskEvents, target, onTaskEnd])

    const contextValue = useMemo(() => {
        return computeAnimatorContext(task.action, taskLifecycle)
    }, [task.action, taskLifecycle])

    const childListeners = useMemo((): undefined | AnimatorAnimatableEvents => {
        if (task.action === 'render') {
            // A render task has no animation. We can skip it.
            return
        }
        if (taskEvents === 0) {
            // A task without events has no animation. We can skip it.
            return
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onAnimationEnd, onTransitionEnd}
    }, [task.action, taskEvents, onAnimated])

    const childClass = useMemo(() => {
        const animatorClass = undefined
            ?? className?.(task.action, taskLifecycle)
            ?? computeAnimatorClasses(task.action, taskLifecycle, classPrefix)

        return classes(task.child.props.className, animatorClass)
    }, [task.action, taskLifecycle, task.child.props.className, className, classPrefix])

    const childStyle = useMemo(() => {
        const animatorStyle = computeAnimatorStyles(task.action, taskLifecycle)

        return {...task.child.props.styles, ...animatorStyle}
    }, [task.action, taskLifecycle, task.child.props.styles])

    useEffect(() => {
        eventsRef.current = 0

        if (task.action === 'render') {
            // A render task has no animation and no style to apply.
            onTaskEnd()
            return
        }
        if (taskEvents === 0) {
            // A task without events has no animation and no style to apply.
            onTaskEnd()
            return
        }

        // We must force the flush of pending styles and classes
        // only when not animating (the initial phase).

        const animatorElement = findAnimatorElement(handleRef.current)

        if (! animatorElement) {
            return
        }

        requestStylesFlush(animatorElement as HTMLElement).then(() => {
            // Initial styles and classes have been flushed. Time to fire the animation.
            setTaskLifecycle('animating')
        })
    }, [task.taskId])

    useEffect(() => {
        if (taskLifecycle !== 'animating') {
            // Task is not animating. We don't have to setup the timeout.
            return
        }

        const timeoutId = setTimeout(() => {
            if (isUndefined(timeout)) {
                // No timeout was provided, which means that it was not expected.
                console.warn(
                    '@eviljs/react/transition.Animator:\n'
                    + `transition timeout detected during '${task.action}'.`
                )
            }

            onTaskEnd()
        }, timeout ?? TransitionTimeoutDefault)

        function onClean() {
            clearTimeout(timeoutId)
        }

        return onClean
    }, [taskLifecycle, onTaskEnd])

    const needsHandle = true
        && taskLifecycle === 'initial'  // A mount/unmount needs the handle only during initial phase.
        && task.action !== 'render'     // A render task does not need the handle, because it does not animate.

    // DEBUG LOG POINT: task.taskId, task.action, taskLifecycle, childClass, childStyle, contextValue

    return (
        <TransitionContext.Provider value={contextValue}>
            {cloneElement(task.child, {className: childClass, style: childStyle, ...childListeners})}

            {needsHandle &&
                <template ref={handleRef} style={DisplayNoneStyle}/>
            }
        </TransitionContext.Provider>
    )
}

export function createTransitionState(): TransitionState {
    return {
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
            let nextState = state
            nextState = reduceTransitionChildrenChange(nextState, {
                children: event.children,
                observers: {
                    onEntered: event.onEntered,
                    onExited: event.onExited,
                    onEnd: event.onEnd,
                },
                mode: event.mode ?? 'cross',
                initial: event.initial ?? false,
            })
            nextState = {...nextState, initial: false, children: event.children}
            nextState = reduceTransitionQueue(nextState)
            return nextState
        }

        case 'TaskCompleted': {
            let nextState = state
            nextState = reduceTransitionTaskCompletion(nextState, event.taskId),
            nextState = reduceTransitionQueue(nextState)
            return nextState
        }

        case 'QueueChanged': {
            return reduceTransitionQueue(state)
        }
    }

    return state
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
    const oldChild = asValidChild(oldChildren)
    const newChild = asValidChild(newChildren)
    const oldChildValid = isValidChild(oldChild)
    const newChildValid = isValidChild(newChild)

    if (! oldChildValid && ! newChildValid) {
        // We have no animation to do.
        return state
    }

    if (! oldChildValid && newChildValid) {
        // The child has been passed; we must mount it.
        const queuedTasks = createMountTasks({state, child: newChild, observers, initial, initialRender})
        const queue = [...state.queue, ...queuedTasks]
        return {...state, queue}
    }

    if (oldChildValid && ! newChildValid) {
        // The child has been removed; we must unmount it.
        const queuedTasks = createUnmountTasks({state, child: oldChild, observers})
        const queue = [...state.queue, ...queuedTasks]
        return {...state, queue}
    }

    if (oldChildValid && newChildValid && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous one and mount the new one.
        const queuedTasks = createExchangeTasks({state, mode, oldChild, newChild, observers})
        const queue = [...state.queue, ...queuedTasks]
        return {...state, queue}
    }

    if (oldChildValid && newChildValid && areSameChildren(oldChild, newChild)) {
        // The child has been update; we must propagate the update.
        return reduceTransitionChildUpdate(state, {child: newChild, observers})
    }

    console.warn(
        '@eviljs/react/transition.reduceTransitionChildrenChange:\n'
        + 'unexpected children condition.',
        oldChild, newChild,
    )

    return state
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
            '@eviljs/react/transition.reduceTransitionChildUpdate:\n'
            + 'the candidate task for the update was not found.'
        )
        return {...state, children: child}
    }

    return nextState
}

export function reduceTransitionTaskCompletion(state: TransitionState, taskId: TransitionTaskId): TransitionState {
    const tasks = state.tasks.map((it): typeof it =>
        it.taskId === taskId
            ? {...it, completed: true}
            : it
    )

    return {...state, tasks}
}

export function reduceTransitionQueue(state: TransitionState): TransitionState {
    if (state.queue.length === 0) {
        // Queue is empty. We have nothing to do.
        return state
    }

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
        completed: false,
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

    const transactionId = state.transactionCounter
    const taskId = state.taskCounter

    return {
        transactionId,
        taskId,
        action: task.action,
        child: task.child,
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
                    observers,
                    key: undefined,
                }),
            )
            : createTasksGroup(state,
                createTask(state, {
                    action: 'render',
                    child,
                    observers,
                    key: undefined,
                }),
            )
        ,
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
                observers,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: <Fragment/>,
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
                observers,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'mount',
                child: newChild,
                observers,
                key: undefined,
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
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
                observers,
                key: keys => keys[0],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'mount',
                child: newChild,
                observers,
                key: undefined,
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
                observers: undefined,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'mount',
                child: newChild,
                observers,
                key: undefined,
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'unmount',
                child: oldChild,
                observers,
                key: keys => keys[0],
            }),
            createTask(state, {
                action: 'render',
                child: newChild,
                observers: undefined,
                key: keys => keys[1],
            }),
        ),
        createTasksGroup(state,
            createTask(state, {
                action: 'render',
                child: newChild,
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

export function computeAnimatorContext(
    action: TransitionTaskAction,
    lifecycle: AnimatorTaskLifecycle,
): TransitionContext {
    switch (action) {
        case 'mount':
            return {action: 'mount', phase: lifecycle === 'animated' ? 'entered' : 'entering'}
        case 'unmount':
            return {action: 'unmount', phase: lifecycle === 'animated' ? 'exited' : 'exiting'}
        case 'render':
            return {action: 'mount', phase: 'entered'}
    }

    console.warn(
        '@eviljs/react/transition.computeAnimatorLifecycle:\n'
        + 'unrecognized lifecycle.'
    )
    return {} as never
}

export function computeAnimatorClasses(
    action: TransitionTaskAction,
    lifecycle: AnimatorTaskLifecycle,
    prefix?: undefined | string
): undefined | string {
    switch (lifecycle) {
        case 'animated':
            return
    }

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
        return
    }

    return classes({
        [`${prefix ?? ''}${name}-from`]: lifecycle === 'initial',
        [`${prefix ?? ''}${name}-to`]: lifecycle === 'animating',
    })
}

export function computeAnimatorStyles(
    action: TransitionTaskAction,
    lifecycle: AnimatorTaskLifecycle,
): undefined | React.CSSProperties {
    switch (action) {
        case 'mount':
            switch (lifecycle) {
                case 'initial':
                    // The element has just been added to the DOM. We need to
                    // hide it during the 'enter-from' phase. It will be revealed
                    // during the 'enter-to' phase.
                    return {visibility: 'hidden'}
                    // return {opacity: 0} // does not work with display: 'contents'.
                    // return {display: 'none'} // Causes a layout shift.
            }
        break
        case 'unmount':
            switch (lifecycle) {
                case 'animated':
                    return {display: 'none'}
            }
        break
    }
    return
}

export function asValidChild(child: TransitionChildren): undefined | TransitionElement {
    if (! isValidChild(child)) {
        return
    }
    return child
}

export function isValidChild(children: TransitionChildren): children is TransitionElement {
    return isValidElement(children)
}

export function areSameChildren(a?: undefined | TransitionElement, b?: undefined | TransitionElement) {
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

export function findAnimatorElement(handleElement: undefined | null | HTMLElement) {
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
        // No target was provided. Any event must be considered valid.
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
    className?: undefined | ((action: TransitionTaskAction, lifecycle: AnimatorTaskLifecycle) => string)
    classPrefix?: undefined | string
    enter?: undefined | number
    exit?: undefined | number
    target?: undefined | TransitionEventTarget
    timeout?: undefined | number
}

export type TransitionChildren = undefined | null | boolean | number | string | TransitionElement
export type TransitionElement = JSX.Element | React.ReactElement<AnimatorAnimatable, React.JSXElementConstructor<AnimatorAnimatable>>
export type TransitionEventTarget = undefined | string | Array<string>
export type TransitionMode = 'cross' | 'out-in' | 'in-out'

export interface TransitionObservers {
    onEntered?: undefined | (() => void)
    onExited?: undefined | (() => void)
    onEnd?: undefined | (() => void)
}

export type TransitionContext =
    | {action: 'mount', phase: 'entering' | 'entered'}
    | {action: 'unmount', phase: 'exiting' | 'exited'}

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

export interface TransitionState {
    transactionCounter: number
    taskCounter: number
    children: undefined | TransitionChildren
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
    | {type: 'TaskCompleted', taskId: TransitionTaskId}
    | {type: 'QueueChanged'}

export type TransitionTaskAction = 'mount' | 'unmount' | 'render'
export type AnimatorTaskLifecycle = 'initial' | 'animating' | 'animated'

export interface TransitionTaskSpec {
    action: 'mount' | 'unmount' | 'render'
    child: TransitionElement
    observers: undefined | TransitionObservers
    key: undefined | TransitionKeyComputer
}

export interface TransitionTask<K> {
    transactionId: number
    taskId: TransitionTaskId
    action: TransitionTaskAction
    child: TransitionElement
    observers: undefined | TransitionObservers
    key: K
}

export type TransitionTaskId = number
export type TransitionTaskQueued = TransitionTask<undefined | TransitionKeyComputer>
export type TransitionTaskSelected = TransitionTask<string> & {completed: boolean}
export type TransitionTasksGroupQueued = Array<TransitionTaskQueued>
export type TransitionTasksGroupSelected = Array<TransitionTaskSelected>
export type TransitionTasksQueue = Array<TransitionTasksGroupQueued>

export interface TransitionKeyComputer {
    (keys: Array<string>): undefined | string
}
