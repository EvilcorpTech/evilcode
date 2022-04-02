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
        const updatedState = reduceStateUpdate(state, {
            children,
            observers: {onEntered, onExited, onEnd},
            exit: exit ?? 0,
            enter: enter ?? 0,
            target: asArray(target ?? NoItems),
            mode: mode ?? 'cross',
            initial: initial ?? false,
        })
        const nextState = consumeStateQueue(updatedState)

        setState(nextState) // We derive the state from the props.
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
                    '@eviljs/reactx/transition.Transition.onTaskCompleted:\n'
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

export function reduceStateUpdate(state: TransitionState, spec: {
    children: TransitionChildren,
    observers: TransitionObservers,
    exit: number,
    enter: number,
    target: AnimatorEventTarget,
    mode: TransitionMode,
    initial: boolean,
}): TransitionState {
    const {
        children: newChildren,
        observers,
        enter,
        exit,
        target,
        mode,
        initial,
    } = spec
    const oldChildren = state.children
    const isInitialRender = state.initial
    const oldChild = asOnlyChild(oldChildren)
    const newChild = asOnlyChild(newChildren)

    if (! isValidChild(oldChild) && ! isValidChild(newChild)) {
        // We have nothing to do.
        return state.initial
            ? {...state, initial: false}
            : state
    }

    if (! isValidChild(oldChild) && isValidChild(newChild)) {
        // The child has been passed; we must mount it.
        const spec = {newChild, observers, enter, target, initial, isInitialRender}
        const queue = [...state.queue, ...createMountTasks(spec)]
        return {...state, children: newChild, queue, initial: false}
    }

    if (isValidChild(oldChild) && ! isValidChild(newChild)) {
        // The child has been removed; we must unmount it.
        const spec = {oldChild, observers, exit, target}
        const queue = [...state.queue, ...createUnmountTasks(spec)]
        return {...state, children: newChild, queue, initial: false}
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && ! areSameChildren(oldChild, newChild)) {
        // The child has exchanged; we must unmount previous one and mount the new one.
        const spec = {mode, oldChild, newChild, observers, exit, enter, target}
        const queue = [...state.queue, ...createExchangeTasks(spec)]
        return {...state, children: newChild, queue, initial: false}
    }

    if (isValidChild(oldChild) && isValidChild(newChild) && areSameChildren(oldChild, newChild)) {
        // The child has been update; we must propagate the update.
        updateTasks(state.queue, state.tasks, newChild, observers)
        const queue = [...state.queue]
        return {...state, children: newChild, queue, initial: false}
    }

    return state.initial
        ? {...state, initial: false}
        : state
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
        alive: false,
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
    const initialAnimation = true // We animate the initial render if...
        && isInitialRender // ...it is the initial render...
        && initial // ...and we have to animate the initial render.
    const action = initialAnimation
        ? 'mount'
        : 'render'
    const events = initialAnimation
        ? enter
        : 0 // Because we don't animate, we have no event to wait for.

    return createTasksTransaction([
        createTask(action, newChild, observers, {events, target, alive: true, kind: 'enter'}),
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
        [createTask('render', <Fragment/>, observers, {kind: 'exit'})],
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
            createTask('unmount', oldChild, observers, {events: exit, target, kind: 'exit'}),
            createTask('mount', newChild, observers, {events: enter, target, alive: true, key: createKey}),
        ],
        [
            createTask('render', newChild, observers, {alive: true, kind: 'enter', key: (keys) => keys[1]!}),
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
        [createTask('unmount', oldChild, observers, {events: exit, target, kind: 'exit'})],
        [createTask('mount', newChild, observers, {events: enter, target, alive: true, kind: 'enter'})],
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
            createTask('unmount', oldChild, observers, {events: exit, target, kind: 'exit'}),
            createTask('render', newChild, observers, {alive: true}),
        ],
        [
            createTask('render', newChild, observers, {alive: true, kind: 'enter', key: (keys) => keys[1]!}),
        ],
    )
}

export function updateTasks(
    queue: TransitionTasksQueue,
    tasks: null | TransitionTasksGroup,
    newChild: TransitionElement,
    observers: TransitionObservers,
) {
    // Current tasks group must be the first one (the one with lowest priority).
    const aliveTasks = findAliveTasks([tasks, ...queue])
    const hasAliveTasks = aliveTasks.length > 0
    let forceUpdate = false

    for (const it of aliveTasks) {
        // We mutate the reference in place. It is safe for queued tasks groups
        // because they are not rendered yet.
        updateTask(it, newChild, observers)
        // But it is not safe for current tasks group.
        if (tasks?.includes(it)) {
            // An alive task is inside the current tasks group. We need to force the update.
            forceUpdate = true
        }
    }

    if (! hasAliveTasks) {
        console.warn(
            '@eviljs/reactx/transition.Transition:\n'
            + 'missing alive tasks.'
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

export function findAliveTasks(queue: Array<null | TransitionTasksGroup>) {
    const aliveTasks = queue
        // There is at most one alive task per parallel tasks group.
        .map(tasks => tasks?.find(it => it.alive))
        .filter(filterDefined)

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
    alive: boolean
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