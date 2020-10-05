import {classes, useMountedRef} from './react.js'
import {createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, cloneElement, Fragment} from 'react'
import {isArray} from '@eviljs/std-lib/type.js'
import {useMachine} from './machine.js'

export function Transition(props: TransitionProps) {
    const {children, enter, exit, initial=false, mode='cross', onEnd, onEntered, onExited} = props
    const [queue, setQueue] = useState<TransitionQueue>([])
    const [macroTask, setMacroTask] = useState<TransitionTasks | null>(null)
    const oldChildrenRef = useRef<TransitionElement | null>(null)
    const isInitialRenderRef = useRef(true)
    const newId = useId()

    function createTasksTransaction(...tasksList: Array<TransitionTasks>) {
        const tid = newId()

        for (const tasks of tasksList) {
            for (const task of tasks) {
                task.tid = tid
            }
        }

        return tasksList
    }
    function createTask(action: TransitionTaskAction, child: TransitionElement, flags?: TransitionTaskFlags) {
        return {
            id: newId(),
            tid: -1,
            action,
            child,
            target: false,
            completed: false,
            flags: flags ?? [],
        }
    }
    function createTargetTask(action: TransitionTaskAction, child: TransitionElement, flags?: TransitionTaskFlags) {
        return {
            ...createTask(action, child, flags),
            target: true,
        }
    }

    useEffect(() => {
        const tasks: TransitionQueue = []
        const oldChild = oldChildrenRef.current
        const newChild = isValidChild(children)
            ? children
            : null

        const isInitialRender = isInitialRenderRef.current

        isInitialRenderRef.current = false

        if (! oldChild && ! newChild) {
            // We have nothing to do.
            return
        }
        if (! oldChild && newChild) {
            // The child has been passed; we must mount it.
            tasks.push(...createTasksTransaction(
                [createTargetTask(
                    isInitialRender && ! initial
                        // It is the initial render and we have not been requested to
                        // animate the initial render.
                        ? 'render'
                        : 'mount'
                    ,
                    newChild,
                    ['enter'],
                )]
            ))
        } else
        if (oldChild && ! newChild) {
            // The child has been removed; we must unmount it (previous child).
            tasks.push(...createTasksTransaction(
                [createTargetTask('unmount', oldChild)],
                [createTask('render', <Fragment/>, ['exit'])],
            ))
        } else
        if (
            oldChild && newChild
            &&
            (
                oldChild.type !== newChild.type
                ||
                oldChild.key !== newChild.key
            )
        ) {
            // The child has changed; we must unmount previous child and mount the new one.
            switch (mode) {
                case 'cross':
                    tasks.push(...createTasksTransaction(
                        [
                            // Parallel unmount and mount.
                            createTask('unmount', oldChild, ['exit']),
                            createTargetTask('mount', newChild),
                        ],
                        [createTargetTask('render', newChild, ['enter'])],
                    ))
                break
                case 'out-in':
                    // Unmount then mount.
                    tasks.push(...createTasksTransaction(
                        [createTask('unmount', oldChild, ['exit'])],
                        [createTargetTask('mount', newChild, ['enter'])],
                    ))
                break
                case 'in-out':
                    // Mount then unmount.
                    tasks.push(...createTasksTransaction(
                        [
                            createTask('render', oldChild),
                            createTargetTask('mount', newChild)
                        ],
                        [
                            createTask('unmount', oldChild, ['exit']),
                            createTargetTask('render', newChild),
                        ],
                        [createTargetTask('render', newChild, ['enter'])]
                    ))
                break
            }
        } else
        if (oldChild && newChild) {
            // The child has been update; we must propagate the update.
            const targetTasks = findTargetTasks(queue, macroTask)

            if (targetTasks.length === 0) {
                console.warn(
                    '@eviljs/std-react/animation.Transition:\n'
                    + 'targets tasks can\'t be found.'
                )
                return
            }

            // We mutate the reference in place...
            for (const it of targetTasks) {
                it.child = newChild
            }
            // ...so we must force the update.
            setQueue([...queue])
        }

        oldChildrenRef.current = newChild

        if (tasks.length > 0) {
            setQueue(state => [
                ...state,
                ...tasks,
            ])
        }
    }, [children, mode, initial])

    useEffect(() => {
        const [nextTask] = queue

        if (! nextTask) {
            // We have to leave at least one task set.
            return
        }

        setMacroTask((state) => {
            if (! state) {
                // Current task state is uninitialized.
                return nextTask
            }

            if (state[0].id === nextTask[0].id) {
                // Queue changed due to a forced update. It is done for rendering
                // the update to the target tasks.
                // We play the game, without breaking thinks.
                return [...state]
            }

            return nextTask
        })
    }, [queue])

    useEffect(() => {
        if (! macroTask) {
            return
        }

        const taskCompleted = macroTask.every(it => it.completed)

        if (! taskCompleted) {
            // Task is in progress.
            return
        }

        // Task completed.
        const hasEnterMicroTask = macroTask.find(it => it.flags.includes('enter'))
        const hasExitMicroTask = macroTask.find(it => it.flags.includes('exit'))

        if (hasEnterMicroTask) {
            onEntered?.()
        }
        if (hasExitMicroTask) {
            onExited?.()
        }
        if (hasEnterMicroTask || hasExitMicroTask) {
            onEnd?.()
        }

        // Task can be removed from the queue.
        setQueue((state) => state.slice(1))
    }, [macroTask, onEntered, onExited, onEnd])

    function onTaskCompleted(srcMicroTask: TransitionTask) {
        setMacroTask((macroTask) => {
            if (! macroTask) {
                console.warn(
                    '@eviljs/std-react/animation.Transition.onTaskCompleted:\n'
                    + 'A null macro task completed.'
                )
                return null
            }

            const microTask = macroTask.find(it => it.id === srcMicroTask.id)

            if (! microTask) {
                console.warn(
                    '@eviljs/std-react/animation.Transition.onTaskCompleted:\n'
                    + 'Missing micro task.'
                )
                return null
            }

            // We mutate the reference in place...
            microTask.completed = true
            // ...so we must force the update.
            return [...macroTask]
        })
    }

    const onMountEnd = useCallback((task: TransitionTask) => {
        onTaskCompleted(task)
    }, [])

    const onUnmountEnd = useCallback((task: TransitionTask) => {
        onTaskCompleted(task)
    }, [])

    function createAnimatedTaskFor(
        task: TransitionTask,
        type: 'enter' | 'exit',
        events: number | undefined,
        onEnd: (task: TransitionTask) => void,
    ) {
        return (
            <AnimatedTransition
                key={task.id}
                type={type}
                events={events}
                onEnd={() => onEnd(task)}
            >
                {task.child}
            </AnimatedTransition>
        )
    }

    function createAnimatedTask(task: TransitionTask) {
        switch (task.action) {
            case 'unmount':
                return createAnimatedTaskFor(task, 'exit', exit, onUnmountEnd)
            case 'mount':
                return createAnimatedTaskFor(task, 'enter', enter, onMountEnd)
            case 'render':
                return createAnimatedTaskFor(task, 'enter', 0, onMountEnd)
        }
    }

    if (! macroTask) {
        return null
    }

    return (
        <Fragment>
            {macroTask.map(createAnimatedTask)}
        </Fragment>
    )
}

export function AnimatedTransition(props: AnimatedTransitionProps) {
    const {children, type, events, onEnd} = props
    const mountedRef = useMountedRef()
    const [state, dispatch] = useMachine(transitionMachine, () => createTransitionMachineState(events))
    const {lifecycle} = state

    useEffect(() => {
        switch (lifecycle) {
            case 'done':
                onEnd?.()
            break
        }
    }, [lifecycle])

    useLayoutEffect(() => {
        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                if (mountedRef.current) {
                    dispatch('flushed')
                }
            }
        ))
    }, [children])

    const listeners = useMemo(() => {
        function onAnimated(/* event: AnimationEvent | TransitionEvent */) {
            dispatch('event')
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        return {onTransitionEnd, onAnimationEnd}
    }, [])

    const styles = (() => {
        switch (type) {
            case 'enter':
                if (lifecycle === 'init') {
                    return {visibility: 'hidden'}
                }
            break
            case 'exit':
                if (lifecycle === 'done') {
                    return {visibility: 'hidden'}
                }
            break
        }

        return // Makes TypeScript happy.
    })()

    const childProps = {
        ...children.props,
        ...listeners,
        className: classes(children.props.className, {
            [`${type}-from`]: lifecycle === 'init',
            [`${type}-to`]: lifecycle === 'ready',
        }),
        style: {
            ...children.props.style,
            ...styles,
        },
    }

    const child = cloneElement(children, childProps)

    return child
}

export function useId() {
    const idRef = useRef(0)

    function id() {
        idRef.current += 1

        return idRef.current
    }

    return id
}

export function createTransitionMachineState(expectedEvents?: number): TransitionMachineState {
    return {
        lifecycle: expectedEvents
            ? 'init'
            : 'done' // 0, null or undefined transition to the final state.
        ,
        actualEvents: 0,
        expectedEvents: expectedEvents ?? 0,
    }
}

export function transitionMachine(state: TransitionMachineState, event: TransitionMachineEvent): TransitionMachineState {
    switch (state.lifecycle) {
        case 'init':
            switch (event) {
                case 'flushed': return {
                    ...state,
                    lifecycle: 'ready',
                }
            }
        break
        case 'ready':
            switch (event) {
                case 'event': return (() => {
                    const actualEvents = state.actualEvents + 1

                    return {
                        ...state,
                        actualEvents,
                        lifecycle: (actualEvents < state.expectedEvents)
                            ? 'ready'
                            : 'done'
                        ,
                    } as const
                })()
            }
        break
    }

    return state
}

export function isValidChild(children: TransitionChildren): children is TransitionElement {
    return children && children !== true
        ? true
        : false
}

export function asArray<T>(item: T | Array<T>) {
    return isArray(item)
        ? item
        : [item]
}

export function findTargetTasks(queue: TransitionQueue, macroTask: TransitionTasks | null) {
    // First, we must look inside the last element of the queue.
    let idx = queue.length - 1
    const targets: Array<TransitionTask | undefined> = []

    while (idx >= 0) {
        const tasks = queue[idx]
        const targetTask = findTargetTaskOf(tasks)
        targets.push(targetTask)

        idx -= 1
    }

    // Second, we take in account the current task.
    const targetTaskOfCurrent = findTargetTaskOf(macroTask)
    targets.push(targetTaskOfCurrent)

    const validTargets = targets.filter(Boolean) as Array<TransitionTask>
    const lastTargetTask = validTargets[0] // The last inserted (in time) task.
    const transactionId = lastTargetTask?.tid
    const transactionTasks = validTargets.filter(it => it.tid === transactionId)

    return transactionTasks
}

export function findTargetTaskOf(task: TransitionTasks | null) {
    if (! task) {
        return
    }

    // There is at most one target per parallel task.
    return task.find(it => it.target)
}

// Types ///////////////////////////////////////////////////////////////////////

export type TransitionElement = JSX.Element

export type TransitionMode = 'cross' | 'out-in' | 'in-out'

export interface TransitionProps {
    children?: TransitionChildren
    enter?: number
    exit?: number
    initial?: boolean
    mode?: TransitionMode
    onEntered?(): void
    onExited?(): void
    onEnd?(): void
}

export interface AnimatedTransitionProps {
    children: TransitionElement
    type: 'enter' | 'exit'
    events?: number
    onEnd?(): void
}

export type TransitionChildren = TransitionElement | boolean | null | undefined
export type TransitionTaskId = number
export type TransitionTaskAction = 'unmount' | 'mount' | 'render'
export type TransitionTaskFlag = 'enter' | 'exit'
export type TransitionTaskFlags = Array<TransitionTaskFlag>

export interface TransitionTask {
    id: TransitionTaskId
    tid: TransitionTaskId
    action: TransitionTaskAction
    child: TransitionElement
    flags: TransitionTaskFlags
    target: boolean
    completed: boolean
}
export type TransitionTasks = Array<TransitionTask>
export type TransitionQueue = Array<TransitionTasks>

export type TransitionLifecycle =
    | 'init'
    | 'ready'
    | 'done'

export interface TransitionMachineState {
    lifecycle: TransitionLifecycle
    expectedEvents: number
    actualEvents: number
}

export type TransitionMachineEvent =
    | 'event' // Fired when a transition/animation event is received.
    | 'flushed' // Fired when children and styles have been applied to the DOM.
