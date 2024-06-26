import {asArray} from '@eviljs/std/type-as.js'
import {isSome, isString, isUndefined} from '@eviljs/std/type-is.js'
import {flushStyles} from '@eviljs/web/animation.js'
import {
    Fragment,
    cloneElement,
    isValidElement,
    memo,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState
} from 'react'
import {classes} from './classes.js'
import {defineContext} from './ctx.js'

const DisplayNoneStyle: React.CSSProperties = {display: 'none'}

export const TransitionContext = defineContext<TransitionContext>('TransitionContext')
export const TransitionTimeoutDefault = 2_000

export function useTransitionContext() {
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

    const onTaskEnd = useCallback((taskId: TransitionTaskId, observers: undefined | TransitionObservers) => {
        observers?.onEntered?.()
        observers?.onExited?.()
        observers?.onEnd?.()

        dispatch({type: 'TaskCompleted', taskId})
    }, [])

    return (
        <>
            {state.tasks.map((it, idx) =>
                <AnimatorMemo
                    key={it.key}
                    taskAction={it.action}
                    taskChild={it.child}
                    taskId={it.taskId}
                    taskObservers={it.observers}
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
    const {
        className,
        classPrefix,
        target,
        timeout,
        taskAction,
        taskChild,
        taskId,
        taskObservers,
        onEnd,
    } = props
    const handleRef = useRef<null | HTMLTemplateElement>(null)
    const eventsRef = useRef(0)
    const [tasksLifecycle, setTasksLifecycle] = useState<State>({})

    type State = Record<TransitionTaskId, undefined | AnimatorTaskLifecycle>

    // We use the taskId as indirection of the task state, to be sure that the
    // task state is reset immediately when the taskId changes. Otherwise, using
    // an useEffect/useLayoutEffect, we would have an old/stale state on first render,
    // resulting in wrong context value, wrong classes and wrong styles.
    const taskLifecycle = tasksLifecycle[taskId] ?? (
        taskAction === 'render'
            ? 'animated' // Optimization: A render task must transition directly to the animated state, avoiding useless renders.
            : 'initial'
    )

    const setTaskLifecycle = useCallback((taskId: TransitionTaskId, state: AnimatorTaskLifecycle) => {
        setTasksLifecycle({[taskId]: state})
    }, [])

    const taskEvents = (() => {
        switch (taskAction) {
            case 'mount':
                return Math.max(0, props.enter ?? 1)
            case 'unmount':
                return Math.max(0, props.exit ?? 1)
            case 'render':
                // A render task has no animation and no animation event.
                return 0
        }
    })()

    if (true
        && taskLifecycle !== 'animated'
        && taskEvents === 0
    ) {
        // We derive the state. In this way a mount/unmount action with 0 events
        // is reflected immediately (without re-layout, re-paint and flashing).
        setTaskLifecycle(taskId, 'animated')
    }

    const onAnimated = useCallback((event: AnimatorCompletionEvent) => {
        if (eventsRef.current >= taskEvents) {
            // The task completed. We skip additional notifications.
            return
        }

        // In case no target is provided, we use the child root (host element) by default.
        const eventFilter = target ?? findAnimatorElement(handleRef.current)
        const validEvent = isValidAnimatorEvent(event, eventFilter)

        if (! validEvent) {
            return
        }

        eventsRef.current += 1

        if (eventsRef.current < taskEvents) {
            return
        }

        setTaskLifecycle(taskId, 'animated')
    }, [taskId])

    const contextValue = useMemo(() => {
        return computeAnimatorContext(taskAction, taskLifecycle)
    }, [taskAction, taskLifecycle])

    const childListeners = useMemo((): undefined | AnimatorAnimatableEvents => {
        if (taskEvents === 0) {
            // A task without events has no animation. We can skip it.
            return
        }
        if (taskAction === 'render') {
            // A render task has no animation. We can skip it.
            return
        }

        return {
            onAnimationEnd: onAnimated,
            onTransitionEnd: onAnimated,
        }
    }, [taskEvents, taskAction, onAnimated])

    const childClass = useMemo(() => {
        const animatorClass = undefined
            ?? className?.(taskAction, taskLifecycle)
            ?? computeAnimatorClasses(taskAction, taskLifecycle, classPrefix)

        return classes(taskChild.props.className, animatorClass)
    }, [taskAction, taskLifecycle, taskChild.props.className, className, classPrefix])

    const childStyle = useMemo(() => {
        const animatorStyle = computeAnimatorStyles(taskAction, taskLifecycle)

        return {...taskChild.props.styles, ...animatorStyle}
    }, [taskAction, taskLifecycle, taskChild.props.styles])

    useLayoutEffect(() => {
        eventsRef.current = 0

        if (taskEvents === 0) {
            // A task without events has no animation and no style to apply.
            return
        }
        if (taskAction === 'render') {
            // A render task has no animation and no style to apply.
            return
        }
        if (taskLifecycle !== 'initial') {
            // Styles and classes must be flushed only during the initial phase (when not animating).
            return
        }

        const animatorElement = findAnimatorElement(handleRef.current)

        if (! animatorElement) {
            // We can't find an element to animate. It can happen with suspended
            // components. We transition to the animated (final) state.
            setTaskLifecycle(taskId, 'animated')
            return
        }

        flushStyles(animatorElement as HTMLElement) // 1) Initial styles and classes have been flushed.
        setTaskLifecycle(taskId, 'animating')  // 2) Time to fire the animation.
    }, [taskId/*, taskAction, taskLifecycle */])

    useEffect(() => {
        const taskEnded = false
            || taskEvents === 0
            || taskAction === 'render'
            || taskLifecycle === 'animated'

        if (! taskEnded) {
            return
        }

        onEnd(taskId, taskObservers)
    }, [taskEvents, taskAction, taskLifecycle])

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
                    + `transition timeout detected during '${taskAction}'.`
                )
            }

            setTaskLifecycle(taskId, 'animated')
        }, timeout ?? TransitionTimeoutDefault)

        function onClean() {
            clearTimeout(timeoutId)
        }

        return onClean
    }, [taskLifecycle/*, taskId */])

    const needsHandle = true
        && taskLifecycle !== 'animated' // A completed mount/unmount does not need the handle.
        && taskAction !== 'render'      // A render task does not need the handle (because it does not animate).

    // DEBUG LOG POINT: taskId, taskAction, taskLifecycle, childClass, childStyle, contextValue

    return (
        <TransitionContext.Provider value={contextValue}>
            {cloneElement(taskChild, {className: childClass, style: childStyle, ...childListeners})}

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
        children: undefined,
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
    let stateChanged = false

    const tasks = state.tasks.map((it): typeof it => {
        if (it.taskId !== taskId) {
            return it
        }
        if (it.completed) {
            // Render tasks are completed by default.
            // Optimization: we don' mutate an already completed task, avoiding useless renders.
            return it
        }

        stateChanged = true
        return {...it, completed: true}
    })

    return stateChanged // Optimization: avoids useless renders.
        ? {...state, tasks}
        : state
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
        completed: task.action === 'render'
            ? true // A render task is implicitly completed.
            : false // A mount/unmount task must be completed.
        ,
    }
}

export function createTasksTransaction(
    state: TransitionState,
    ...tasks: Array<undefined | Array<TransitionTaskQueued>>
): Array<Array<TransitionTaskQueued>> {
    ++state.transactionCounter

    return tasks.filter(isSome)
}

export function createTasksGroup(
    state: TransitionState,
    ...tasks: Array<undefined | TransitionTaskQueued>
): Array<TransitionTaskQueued> {
    return tasks.filter(isSome)
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
        }
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

export function findAnimatorElement(handleElement: null | HTMLElement) {
    return handleElement?.previousElementSibling ?? undefined
}

export function isValidAnimatorEvent(
    event: AnimatorCompletionEvent,
    target: undefined | TransitionEventTarget,
) {
    // Note: in case no target is provided, any event must be considered valid.

    if (! target) {
        return true
    }

    const targets = asArray(target)

    if (targets.length === 0) {
        return true
    }

    const eventTarget = event.target as Partial<HTMLElement>

    for (const it of targets) {
        if (it instanceof Element && eventTarget === it) {
            return true
        }
        if (isString(it) && eventTarget.id === it) {
            return true
        }
        if (isString(it) && eventTarget.classList?.contains(it)) {
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
    taskAction: TransitionTaskAction
    taskChild: TransitionElement
    taskId: TransitionTaskId
    taskObservers: undefined | TransitionObservers
    onEnd(taskId: TransitionTaskId, observers: undefined | TransitionObservers): void
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
export type TransitionEventTarget = string | Element | Array<string | Element>
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
