import {useEffect} from 'react'
import {useI18n} from './i18n.js'
import {useRouter} from './router.js'

export const I10nRouteLocaleRegexp = /\/([a-zA-Z]{2})(?:\/|$)/

export function useRouteLocale(routeLocalePattern?: undefined | string | RegExp) {
    const {locale, setLocale} = useI18n()!
    const {matchRoute} = useRouter()!

    useEffect(() => {
        const [wholeMatch, routeLocale] = matchRoute(routeLocalePattern ?? I10nRouteLocaleRegexp) ?? []

        if (! routeLocale) {
            return
        }

        setLocale(routeLocale)
    }, [matchRoute])

    return locale
}
