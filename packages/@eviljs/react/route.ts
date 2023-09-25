import type {RoutePathCodec, RoutePatternArgs} from '@eviljs/web/route-v2.js'
import {useCallback} from 'react'
import {useI18n} from './i18n.js'

export function useRoutePath<A extends RoutePatternArgs>(routeSpec: RoutePathCodec<A>): RouteManager<A> {
    return {
        match: routeSpec.match,
        link: routeSpec.encode,
    }
}

export function useRoutePathLocalized<A extends RoutePatternArgs>(
    routeSpec: RoutePathCodec<[string, ...A]>,
): RouteManager<A> {
    const routePath = useRoutePath(routeSpec)
    const {locale} = useI18n()!

    const link = useCallback((...args: A): string => {
        return routePath.link(locale, ...args)
    }, [routePath.link, locale])

    const {match} = routePath

    return {match, link}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouteManager<A extends RoutePatternArgs> extends Pick<RoutePathCodec<[]>, 'match'> {
    link(...args: A): string
}
