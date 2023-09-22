import {isSome} from '@eviljs/std/type.js'
import {useMemo} from 'react'
import {useRouter} from './router.js'

export const RoutePathLocaleRegexp = /\/([a-zA-Z]{2})(?:\/|$)/

export function useRoutePathLocale(options?: undefined | UseRoutePathLocaleOptions) {
    const {matchRoute} = useRouter()!

    const locale = useMemo(() => {
        const [wholeMatch, routeLocale] = matchRoute(RoutePathLocaleRegexp) ?? []

        if (! routeLocale) {
            return
        }

        return routeLocale.toLowerCase()
    }, [matchRoute])

    return locale
}

export function useRouteParamLocale(options?: undefined | UseRouteParamsLocaleOptions) {
    const {route} = useRouter()!
    const name = options?.name
    const names = options?.names ?? ['lang', 'locale']

    const locale = useMemo(() => {
        const keys = [name, ...names].filter(isSome)

        for (const key in keys) {
            const value = route.params?.[key]

            if (! value?.trim()) {
                continue
            }

            return value.toLowerCase()
        }

        return // Makes TypeScript happy.
    }, [route.params, name/*, names*/])

    return locale
}

// Types ///////////////////////////////////////////////////////////////////////

export interface UseRoutePathLocaleOptions {
}

export interface UseRouteParamsLocaleOptions {
    name?: undefined | string
    names?: undefined | Array<string>
}
