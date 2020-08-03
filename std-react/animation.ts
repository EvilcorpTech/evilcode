import {classes, useMountedRef} from './react'
import {cloneElement, useEffect, useLayoutEffect, useMemo, useRef, Children} from 'react'
import {useMachine} from './machine'

export function Transition(props: TransitionProps) {
    const {children, enter, exit, ...otherProps} = props
    const childrenRef = useRef<JSX.Element | null | undefined>(children)
    const animationsRef = useRef(0)
    const mountedRef = useMountedRef()
    const [lifecycle, dispatch] = useMachine(runTransitionMachine, 'init')
    const noEnterAnimations = ! enter
    const noExitAnimations = ! exit

    useEffect(() => {
        animationsRef.current = 0
    }, [lifecycle])

    useEffect(() => {
        if (lifecycle === 'entering' && noEnterAnimations) {
            dispatch('animated')
        }
        if (lifecycle === 'exiting' && noExitAnimations) {
            dispatch('animated')
        }
    }, [lifecycle, noEnterAnimations, noExitAnimations])

    useLayoutEffect(() => {
        if (children) {
            childrenRef.current = children
        }

        dispatch(children
            ? 'can-enter'
            : 'can-exit'
        )

        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                if (mountedRef.current) {
                    dispatch('flushed')
                }
            }
        ))
    }, [children])

    const listeners = useMemo(() => {
        function onAnimated(event: AnimationEvent | TransitionEvent) {
            animationsRef.current += 1

            const animationsCount = animationsRef.current
            const expectedAnimations = (() => {
                switch (lifecycle) {
                    case 'entering':
                        return enter ?? 0
                    break
                    case 'exiting':
                        return exit ?? 0
                    break
                }
                return 0 // Makes TypeScript happy.
            })()

            if (animationsCount >= expectedAnimations) {
                dispatch('animated')
            }
        }

        const onAnimationEnd = onAnimated
        const onTransitionEnd = onAnimated

        switch (lifecycle) {
            case 'entering':
            case 'exiting':
                return {onTransitionEnd, onAnimationEnd}
            break
        }

        return // Makes TypeScript happy.
    }, [lifecycle])

    if (lifecycle === 'entered') {
        return children ?? null
    }
    if (lifecycle === 'exited') {
        return null
    }
    if (! childrenRef.current) {
        return null
    }

    const child = Children.only(childrenRef.current)
    const animatedProps = {
        ...child.props,
        ...listeners,
        className: classes(child.props.className, {
            'enter-from': lifecycle === 'enter',
            'enter-to': lifecycle === 'entering',
            'exit-from': lifecycle === 'exit',
            'exit-to': lifecycle === 'exiting',
        }),
    }
    const animatedChild = cloneElement(child, animatedProps)

    return animatedChild
}

export function runTransitionMachine(state: TransitionLifecycle, event: TransitionMachineEvent) {
    switch (state) {
        case 'init':
            switch (event) {
                case 'can-enter': return 'enter'
                case 'can-exit': return 'exit'
            }
        break
        case 'enter':
            switch (event) {
                case 'flushed': return 'entering'
                case 'can-exit': return 'exit'
            }
        break
        case 'entering':
            switch (event) {
                case 'animated': return 'entered'
                case 'can-exit': return 'exit'
            }
        break
        case 'entered':
            switch (event) {
                case 'can-exit': return 'exit'
            }
        break
        case 'exit':
            switch (event) {
                case 'flushed': return 'exiting'
                case 'can-enter': return 'enter'
            }
        break
        case 'exiting':
            switch (event) {
                case 'animated': return 'exited'
                case 'can-enter': return 'enter'
            }
        break
        case 'exited':
            switch (event) {
                case 'can-enter': return 'enter'
            }
        break
    }

    return state
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TransitionProps {
    children?: JSX.Element | null | undefined
    enter?: number
    exit?: number
    [key: string]: unknown
}

export type TransitionLifecycle =
    | 'init'
    | 'enter' | 'entering' | 'entered'
    | 'exit' | 'exiting' | 'exited'

export type TransitionMachineEvent =
    | 'can-enter' // Fired when children are provided.
    | 'flushed' // Fired when children have been applied to the DOM.
    | 'animated' // Fired when the CSS exit/enter animation/transition has completed.
    | 'can-exit' // Fired when children are not provided.
