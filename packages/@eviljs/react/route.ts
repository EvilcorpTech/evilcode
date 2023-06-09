import type {RoutePathDefinition, RoutePatternArgs} from '@eviljs/web/route-v2.js'
import {useCallback} from 'react'
import {useI18n} from './i18n.js'

export function useRoutePath<A extends RoutePatternArgs>(routeSpec: RoutePathDefinition<A>): RouteManager<A> {
    return {
        patterns: routeSpec.match,
        link: routeSpec.encode,
    }
}

export function useRoutePathLocalized<A extends RoutePatternArgs>(
    routeSpec: RoutePathDefinition<[string, ...A]>,
): RouteManager<A> {
    const routePath = useRoutePath(routeSpec)
    const {locale} = useI18n()!

    const {patterns} = routePath

    const link = useCallback((...args: A): string => {
        return routePath.link(locale, ...args)
    }, [routePath.link, locale])

    return {patterns, link}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouteManager<A extends RoutePatternArgs> {
    patterns: Array<string>
    link(...args: A): string
}
