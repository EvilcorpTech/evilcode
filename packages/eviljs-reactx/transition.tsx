import {classes} from '@eviljs/react/classes.js'
import {filterDefined, lastOf} from '@eviljs/std/array.js'
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

export const TransitionContext = createContext<TransitionContext>([])

TransitionContext.displayName = 'TransitionContext'

export let Id = 0
const NoItems: [] = []

export function Transition(props: TransitionProps) {
    const {children, exit, enter, target, initial, mode, onEntered, onExited, onEnd} = props
    const [state, setState] = useState<TransitionState>(createTransitionState)

    if (children !== state.children) {
        // Component rendered. Let's see what to do with the updated children.
        const queue = reduceStateQueue(state, {
            children,
            observers: {onEntered, onExited, onEnd},
            exit: exit ?? 0,
            enter: enter ?? 0,
            target: asArray(target ?? NoItems),
            mode: mode ?? 'cross',
            initial: initial ?? false,
        })
        const nextState = consumeStateQueue({...state, queue})

        // We derive the state from the props.
        setState({...nextState, children, initial: false})
    }

    useEffect(() => {
        if (! areTasksCompleted(state.tasks)) {
            // Tasks group is in progress.
            return
        }

        // Tasks group is completed.
        const {tasks} = state
        const enterObserver = tasks.find(it => it.kind === 'enter')
        const exitObserver = tasks.find(it => it.kind === 'exit')

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

        const nextState = consumeStateQueue(state)

        setState(nextState)
    }, [state])

    const onTaskCompleted = useCallback((completedTask: TransitionTask) => {
        setState(state => {
            const task = state.tasks.find(it => it.id === completedTask.id)

            if (! task) {
                console.warn(
                    '@eviljs/reactx/transition.onTaskCompleted:\n'
                    + 'missing completed task.'
                )
                return state
            }

            // We mutate the reference in place...
            task.completed = true
            // ...so we must force the update.
            return {...state}
        })
    }, [])

    return (
        <Fragment>
            {state.tasks.map((it, idx) =>
                renderAnimator(it, state.keys[idx]!, onTaskCompleted))
            }
        </Fragment>
    )
}

export function Animator(props: AnimatorProps) {
    const {children, id, type, events, target, onEnd} = props
    const [state, setState] = useState(() => createAnimatorState(id))
    const animatorRef = useRef<null | HTMLDivElement>(null)
    const collectedEventsRef = useRef(0)
    const {lifecycle} = state

    if (id !== state.id) {
        // We derive the state from the id. Which means that when the task
        // changes, we create a new default state, re-rendering immediately.
        setState(createAnimatorState(id))
    }
    if (events === 0 && state.lifecycle !== 'completed') {
        // 0 events transitions immediately to the final state.
        // 'render' tasks have always 0 expected events.
        setState(state => ({...state, lifecycle: 'completed'}))
    }

    const context = useMemo((): TransitionContext => {
        switch (type) {
            case 'render': {
                return ['mount', 'entered']
            }
            case 'mount': {
                switch (lifecycle) {
                    case 'initial': return ['mount', 'enter']
                    case 'active': return ['mount', 'entering']
                    case 'completed': return ['mount', 'entered']
                }
            }
            case 'unmount': {
                switch (lifecycle) {
                    case 'initial': return ['unmount', 'exit']
                    case 'active': return ['unmount', 'exiting']
                    case 'completed': return ['unmount', 'exited']
                }
            }
        }
    }, [type, lifecycle])

    useLayoutEffect(() => {
        collectedEventsRef.current = 0
    }, [id])

    useLayoutEffect(() => {
        if (! animatorRef.current) {
            return
        }
        if (type === 'render') {
            // A render task has no animation and no styles to apply.
            return
        }
        if (lifecycle !== 'initial')  {
            // We must force the flush/apply of pending styles and classes only
            // during the init phase.
            return
        }

        applyStyles(animatorRef.current)

        // Init styles and classes have been flushed. Time to fire the animation.

        setState(state =>
            state.lifecycle === 'initial'
                ? {...state, lifecycle: 'active'}
                : state
        )
    }, [id, lifecycle])
    // We need id as dependency because the state can transition from
    // 'completed' to 'completed' again, when the events are 0.

    useEffect(() => {
        switch (lifecycle) {
            case 'completed':
                onEnd?.()
            break
        }
    }, [id, lifecycle])
    // We need id as dependency because the state can transition from
    // 'completed' to 'completed' again, when the events are 0.

    const listeners = useMemo(() => {
        if (type === 'render') {
            // A render task does not have to wait any animation to complete.
            return
        }
        if (lifecycle === 'completed') {
            // At end phase does not have to wait any animation to complete.
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

                return {...state, lifecycle: 'completed'}
            })
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onAnimationEnd, onTransitionEnd}
    }, [id, lifecycle])

    const child = Children.only(children)
    const presenceClass = presenceAnimationClasses(type, lifecycle)
    const presenceStyles = presenceAnimationStyles(type, lifecycle)

    return (
        <TransitionContext.Provider value={context}>
            <div
                {...listeners}
                ref={animatorRef}
                className="Animator-cbb1"
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

export function reduceStateQueue(state: TransitionState, args: {
    children: TransitionChildren,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    target: AnimatorEventTarget,
    mode: TransitionMode,
    initial: boolean,
}): TransitionTasksQueue {
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
        return state.queue
    }

    if (! isValidChild(oldChild) && isValidChild(newChild)) {
        // The child has been passed; we must mount it.
        const childQueue = createMountTasks({newChild, observers, enter, target, initial, initialRender})
        return [...state.queue, ...childQueue]
    }

    if (isValidChild(oldChild) && ! isValidChild(newChild)) {
        // The child has been removed; we must unmount it.
        const childQueue = createUnmountTasks({oldChild, observers, exit, target})
        return [...state.queue, ...childQueue]
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous one and mount the new one.
        const childQueue = createExchangeTasks({mode, oldChild, newChild, observers, enter, exit, target})
        return [...state.queue, ...childQueue]
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && areSameChildren(oldChild, newChild)) {
        // The child has been update; we must propagate the update.
        updateTasks({tasks: state.tasks, queue: state.queue, child: newChild, observers})
        return state.queue
    }

    console.warn(
        '@eviljs/reactx/transition.reduceStateQueue:\n'
        + 'unrecognized children case.',
        oldChild,
        newChild,
    )

    return state.queue
}

function createTasksTransaction(...transaction: Array<TransitionTasksGroup>) {
    const tid = createId()

    for (const group of transaction) {
        for (const task of group) {
            task.tid = tid
        }
    }

    return transaction
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
        completed: false,
        kind: undefined,
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

export function createMountTasks(args: {
    newChild: TransitionElement,
    observers: TransitionObservers,
    enter: number,
    target: AnimatorEventTarget,
    initial: boolean,
    initialRender: boolean,
}) {
    const {
        newChild,
        observers,
        enter,
        target,
        initial,
        initialRender,
    } = args
    const animated = false
        || (initialRender && initial) // On first render, it is animated only if requested.
        || ! initialRender // After the initial render, it is always animated.
    const action = animated
        ? 'mount'
        : 'render'
    const events = animated
        ? enter
        : 0 // Because we don't animate, we have no event to wait for.

    return createTasksTransaction([
        createTask(action, newChild, observers, {events, target, kind: 'enter'}),
    ])
}

export function createUnmountTasks(args: {
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
    } = args

    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, target})],
        [createTask('render', <Fragment/>, observers, {kind: 'exit'})],
    )
}

export function createExchangeTasks(args: {
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
    } = args

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

export function createCrossTasks(args: {
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
    } = args

    return createTasksTransaction(
        [
            // Parallel unmount and mount.
            createTask('unmount', oldChild, observers, {events: exit, target, kind: 'exit'}),
            createTask('mount', newChild, observers, {events: enter, target, key: createKey}),
        ],
        [
            createTask('render', newChild, observers, {kind: 'enter', key: (keys) => keys[1]!}),
        ],
    )
}

export function createOutInTasks(args: {
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
    } = args

    return createTasksTransaction(
        [createTask('unmount', oldChild, observers, {events: exit, target, kind: 'exit'})],
        [createTask('mount', newChild, observers, {events: enter, target, kind: 'enter'})],
    )
}

export function createInOutTasks(args: {
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
    } = args

    return createTasksTransaction(
        [
            createTask('render', oldChild, observers),
            createTask('mount', newChild, observers, {events: enter, target, key: createKey}),
        ],
        [
            createTask('unmount', oldChild, observers, {events: exit, target, kind: 'exit'}),
            createTask('render', newChild, observers, {}),
        ],
        [
            createTask('render', newChild, observers, {kind: 'enter', key: (keys) => keys[1]!}),
        ],
    )
}

export function updateTasks(args: {
    tasks: TransitionTasksGroup
    queue: TransitionTasksQueue
    child: TransitionElement
    observers: TransitionObservers
}) {
    const {tasks, queue, child, observers} = args

    // Current tasks group must be the first one (the one with lowest priority).
    const allTasks = [tasks, ...queue]
    const lastTasksGroup = lastOf(allTasks)
    const lastTransactionId = lastTasksGroup?.[0]?.tid

    if (! lastTransactionId) {
        console.warn(
            '@eviljs/reactx/transition.updateTasks:\n'
            + 'missing transaction.'
        )
    }

    const lastTransactionTasks = allTasks
        .filter(tasksGroup => tasksGroup.filter(it =>
            true
            && it.tid === lastTransactionId // Those tasks being part of last transaction.
            && areSameChildren(child, it.child) // Who match the child sign.
        ))
        .flat(1)

    if (lastTransactionTasks.length === 0) {
        console.warn(
            '@eviljs/reactx/transition.updateTasks:\n'
            + 'missing updatable tasks.'
        )
    }

    for (const it of lastTransactionTasks) {
        // We mutate the references in place.
        // It is safe because:
        // - queued tasks are not rendered yet
        // - current tasks are rendered updated
        updateTask(it, child, observers)
    }
}

export function updateTask(task: TransitionTask, child: TransitionElement, observers: TransitionObservers): TransitionTask {
    task.child = child

    if (! task.completed) {
        task.observers = observers
    }

    return task
}

export function consumeStateQueue(state: TransitionState): TransitionState {
    if (! areTasksCompleted(state.tasks)) {
        // Task is in progress. We can't consume.
        return state
    }

    // We pop out the tasks group,
    const [tasks, ...queue] = state.queue

    if (! tasks) {
        // There is nothing to consume.
        return state
    }

    const keys = tasks.map((it, idx) =>
        it.key?.(state.keys) // First, we use the task computed key, if any.
        ?? state.keys[idx] // Otherwise we re-use the previous key, if any.
        ?? String(idx) // As last resort, we fallback to the index.
    )

    return {...state, tasks, queue, keys}
}

export function createTransitionState(): TransitionState {
    return {
        children: null,
        initial: true,
        keys: [],
        queue: [],
        tasks: [],
    }
}

export function createAnimatorState(id: TransitionTaskId): AnimatorState {
    return {
        id,
        lifecycle: 'initial',
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
        [`${name}-from`]: lifecycle === 'initial',
        [`${name}-to`]: lifecycle === 'active',
    }
}

export function presenceAnimationStyles(
    type: TransitionTaskAction,
    lifecycle: AnimatorLifecycle,
): undefined | CSSProperties {
    switch (type) {
        case 'unmount':
            switch (lifecycle) {
                case 'completed': {
                    // The unmount animation completed, but the element is still
                    // on the DOM. We need to hide it meanwhile it is removed.
                    // `opacity: 0` does not work with `display: 'contents'`.
                    return {opacity: 0}
                    // return {display: 'none'} // Causes a layout shift.
                    // return {display: 'contents', visibility: 'hidden'} // Glitches on Firefox and Safari.
                }
            }
        break
        case 'mount':
            switch (lifecycle) {
                case 'initial': {
                    // The element has just been added to the DOM. We need to
                    // hide it during the 'mount-from' phase. It must be revealed
                    // during the 'mount-to' phase.
                    return {display: 'contents', visibility: 'hidden'}
                }
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

export function areTasksCompleted(tasks: TransitionTasksGroup) {
    return tasks.every(it => it.completed)
}

export function createId() {
    return ++Id
}

export function createKey() {
    return `transition#${createId()}`
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
    queue: TransitionTasksQueue
    tasks: TransitionTasksGroup
}

export type TransitionTaskEnd = (task: TransitionTask) => void
export type TransitionTaskId = number
export type TransitionTaskAction = 'unmount' | 'mount' | 'render'
export type TransitionTaskKind = undefined | 'enter' | 'exit'

export type TransitionTasksQueue = Array<TransitionTasksGroup>
export type TransitionTasksGroup = Array<TransitionTask>

export interface TransitionTask {
    id: TransitionTaskId
    tid: TransitionTaskId
    action: TransitionTaskAction
    child: TransitionElement
    completed: boolean
    events: number
    kind: TransitionTaskKind
    observers: TransitionObservers
    target: AnimatorEventTarget
    key?(keys: Array<string>): undefined | string
}

export type AnimatorLifecycle =
    | 'initial'
    | 'active'
    | 'completed'

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
