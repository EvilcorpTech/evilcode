import type {RouteArgs, RoutePathCodec} from '@eviljs/web/route-v2'
import {useCallback} from 'react'
import {useI18n} from './i18n.js'

export function useRoutePath<A extends RouteArgs>(routeSpec: RoutePathCodec<A>): RouteManager<A> {
    return {
        patterns: routeSpec.patterns,
        link: routeSpec.encode,
    }
}

export function useRoutePathLocalized<A extends RouteArgs>(
    routeSpec: RoutePathCodec<[string, ...A]>,
): RouteManager<A> {
    const routePath = useRoutePath(routeSpec)
    const {locale} = useI18n()!

    const link = useCallback((...args: A): string => {
        return routePath.link(locale, ...args)
    }, [routePath.link, locale])

    const {patterns} = routePath

    return {patterns, link}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouteManager<A extends RouteArgs> {
    patterns: RoutePathCodec<[]>['patterns']
    link(...args: A): string
}
