import {createCssTransition, play} from '@eviljs/std-web/animation.js'
import React from 'react'
import {useMountedGuard} from './react.js'
import {useRouterTransition} from './router.js'
const {useEffect, useMemo, useState} = React

export function useRoutedViewLifecycle(routeRe: RegExp) {
    const [viewLifecycle, setViewLifecycle] = useState<ViewLifecycle>('exited')
    const {fromRoute, toRoute} = useRouterTransition()

    useEffect(() => {
        const toThisView = routeRe.test(toRoute)
        const fromThisView = routeRe.test(fromRoute)
        const isEntered = fromThisView && toThisView
        const isEntering = ! fromThisView && toThisView
        const isExiting = fromThisView && ! toThisView
        const isExited = ! fromThisView && ! toThisView

        if (isEntered) {
            setViewLifecycle('entered')
        }
        if (isEntering) {
            setViewLifecycle('entering')
        }
        if (isExiting) {
            setViewLifecycle('exiting')
        }
        if (isExited) {
            setViewLifecycle('exited')
        }
    }, [fromRoute, toRoute])

    return [viewLifecycle, setViewLifecycle] as const
}

/*
* EXAMPLE
* const {viewLifecycle, style} = useRoutedViewAnimation(new RegExp('^/about'),
*     () => playFadeInAnimation('.MyView', {transform: 'scale(1.2)'}),
*     () => playFadeOutAnimation('.MyView'),
* )
* if (viewLifecycle === 'exited') {
*     return null
* }
* return <div style={style}>...</div>
*/
export function useRoutedViewAnimation(routeRe: RegExp, enterOptional?: Animator, exitOptional?: Animator) {
    const guardMounted = useMountedGuard()
    const [viewLifecycle, setViewLifecycle] = useRoutedViewLifecycle(routeRe)
    const enter = enterOptional ?? (() => Promise.resolve())
    const exit = exitOptional ?? (() => Promise.resolve())

    const opacity = (() => {
        switch (viewLifecycle) {
            case 'entering':
            case 'exited':
                return 0
            break
        }
        return undefined // Makes TypeScript happy.
    })()

    useEffect(() => {
        switch (viewLifecycle) {
            case 'entering':
                enter().then(guardMounted(() => {
                    setViewLifecycle(state =>
                        state === 'entering'
                            ? 'entered'
                            : state
                    )
                }))
            break
            case 'exiting':
                exit().then(guardMounted(() => {
                    setViewLifecycle(state =>
                        state === 'exiting'
                            ? 'exited'
                            : state
                    )
                }))
            break
        }
    }, [viewLifecycle])

    const style = useMemo(() => {
        return {opacity}
    }, [opacity])

    return {viewLifecycle, style}
}

export function playFadeInAnimation(selector: string, options?: {transform?: string}) {
    const el = getViewElement(selector)

    if (! el) {
        return Promise.resolve()
    }

    const transform = options?.transform ?? ''
    const animation = createCssTransition(el, {
        setup(el) {
            el.style.transition = 'none'
            el.style.transform = transform
        },
        play(el) {
            el.style.transition = 'all var(--std-duration-slow)'
            el.style.transform = ''
            el.style.opacity = '1'
        },
        clean(el) {
            el.style.transition = ''
            // Opacity is cleaned by the render function.
        },
    })

    return play(animation)
}

export function playFadeOutAnimation(selector: string) {
    const el = getViewElement(selector)

    if (! el) {
        return Promise.resolve()
    }

    const animation = createCssTransition(el, {
        play(el) {
            el.style.transition = 'all var(--std-duration-fast)'
            el.style.opacity = '0'
        },
        // Opacity is cleaned by the render function.
    })

    return play(animation)
}

export function getViewElement(selector: string) {
    const el = document.querySelector<HTMLElement>(selector)

    if (! el) {
        console.warn(
            '@eviljs/std-react.getViewElement(~~selector~~)\n'
            + `missing view's animated element "${selector}".`
        )
    }

    return el
}

// Types ///////////////////////////////////////////////////////////////////////

export type ViewLifecycle = 'entering' | 'entered' | 'exiting' | 'exited'

export interface Animator {
    (): Promise<unknown>
}
