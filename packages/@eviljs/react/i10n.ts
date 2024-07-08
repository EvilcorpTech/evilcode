import {isSome} from '@eviljs/std/type-is.js'
import {useMemo} from 'react'
import {useRouteParams, useRoutePathTest} from './router.js'

export const RoutePathLocaleRegexp: RegExp = /\/([a-zA-Z]{2})(?:\/|$)/

export function useRoutePathLocale(options?: undefined | RoutePathLocaleOptions): undefined | string {
    const {matchRoutePath} = useRoutePathTest()

    const locale = useMemo(() => {
        const [wholeMatch, routeLocale] = matchRoutePath(RoutePathLocaleRegexp) ?? []

        if (! routeLocale) {
            return
        }

        return routeLocale.toLowerCase()
    }, [matchRoutePath])

    return locale
}

export function useRouteParamLocale(options?: undefined | RouteParamsLocaleOptions): undefined | string {
    const routeParams = useRouteParams()
    const name = options?.name
    const names = options?.names ?? ['lang', 'locale']

    const locale = useMemo(() => {
        const keys = [name, ...names].filter(isSome)

        for (const key in keys) {
            const value = routeParams?.[key]

            if (! value?.trim()) {
                continue
            }

            return value.toLowerCase()
        }

        return // Makes TypeScript happy.
    }, [routeParams, name/*, names*/])

    return locale
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RoutePathLocaleOptions {
}

export interface RouteParamsLocaleOptions {
    name?: undefined | string
    names?: undefined | Array<string>
}
