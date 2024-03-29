import {createCssTransition, playTimeline} from '@eviljs/web/animation.js'
import {useEffect, useMemo, useState} from 'react'
import {useRouteTransition} from './router.js'

export function useRoutedViewLifecycle(routeRegexp: RegExp) {
    const [viewLifecycle, setViewLifecycle] = useState<ViewLifecycle>('exited')
    const {fromRoute, toRoute} = useRouteTransition()

    useEffect(() => {
        const toThisView = routeRegexp.test(toRoute)
        const fromThisView = routeRegexp.test(fromRoute)
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
*
* const {viewLifecycle, style} = useRoutedViewAnimation(new RegExp('^/about'),
*     () => playFadeInAnimation('.MyView', {transform: 'scale(1.2)'}),
*     () => playFadeOutAnimation('.MyView'),
* )
* if (viewLifecycle === 'exited') {
*     return
* }
* return <div style={style}>...</div>
*/
export function useRoutedViewAnimation(routeRegexp: RegExp, enterOptional?: Animator, exitOptional?: Animator) {
    const [viewLifecycle, setViewLifecycle] = useRoutedViewLifecycle(routeRegexp)
    const enter = enterOptional ?? (() => Promise.resolve())
    const exit = exitOptional ?? (() => Promise.resolve())

    const opacity = (() => {
        switch (viewLifecycle) {
            case 'entering':
            case 'exited':
                return 0
        }
        return undefined // Makes TypeScript happy.
    })()

    useEffect(() => {
        switch (viewLifecycle) {
            case 'entering':
                enter().then(() => {
                    setViewLifecycle(state =>
                        state === 'entering'
                            ? 'entered'
                            : state
                    )
                })
            break
            case 'exiting':
                exit().then(() => {
                    setViewLifecycle(state =>
                        state === 'exiting'
                            ? 'exited'
                            : state
                    )
                })
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
            el.style.transition = 'all var(--std-duration4)'
            el.style.transform = ''
            el.style.opacity = '1'
        },
        clean(el) {
            el.style.transition = ''
            // Opacity is cleaned by the render function.
        },
    })

    return playTimeline(animation)
}

export function playFadeOutAnimation(selector: string) {
    const el = getViewElement(selector)

    if (! el) {
        return Promise.resolve()
    }

    const animation = createCssTransition(el, {
        play(el) {
            el.style.transition = 'all var(--std-duration2)'
            el.style.opacity = '0'
        },
        // Opacity is cleaned by the render function.
    })

    return playTimeline(animation)
}

export function getViewElement(selector: string) {
    const el = document.querySelector<HTMLElement>(selector)

    if (! el) {
        console.warn(
            '@eviljs/react/routed-view.getViewElement(~~selector~~)\n'
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
