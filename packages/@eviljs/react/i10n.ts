import {isSome} from '@eviljs/std/type.js'
import {useMemo} from 'react'
import {useRouter} from './router.js'

export const I10nRouteLocaleRegexp = /\/([a-zA-Z]{2})(?:\/|$)/

export function useRoutePathLocale(options?: UseRoutePathLocaleOptions) {
    const {matchRoute} = useRouter()!

    const locale = useMemo(() => {
        const [wholeMatch, routeLocale] = matchRoute(I10nRouteLocaleRegexp) ?? []

        if (! routeLocale) {
            return
        }

        return routeLocale
    }, [matchRoute])

    return locale
}

export function useRouteParamLocale(options?: UseRouteParamsLocaleOptions) {
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

            return value
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
