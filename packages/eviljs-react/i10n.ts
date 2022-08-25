import {useEffect} from 'react'
import {useI18n} from './i18n.js'
import {useRouter} from './router.js'

export const BaseLocaleRegexp = /\/([a-zA-Z]{2})(?:\/|$)/

export function useRouteLocale(localeRegexpOptional?: RegExp) {
    const {locale, setLocale} = useI18n()!
    const {matchRoute} = useRouter()!

    useEffect(() => {
        const localeRegexp = localeRegexpOptional ?? BaseLocaleRegexp
        const [wholeMatch, routeLocale] = matchRoute(localeRegexp) ?? []

        if (! routeLocale) {
            return
        }

        setLocale(routeLocale)
    }, [matchRoute])

    return locale
}
