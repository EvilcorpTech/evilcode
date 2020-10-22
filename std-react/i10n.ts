import {useI18n} from './i18n.js'
import {useRouter} from './router.js'
import React from 'react'
const {useEffect} = React

export const BaseLocaleRegexp = new RegExp(`/([a-zA-Z]{2})(?:/|$)`)

export function useRouteLocale(localeRe?: RegExp) {
    const {locale, setLocale} = useI18n()
    const {matchRoute} = useRouter()

    useEffect(() => {
        const re = localeRe ?? BaseLocaleRegexp
        const [wholeMatch, routeLocale] = matchRoute(re) ?? []

        if (! routeLocale) {
            return
        }

        setLocale(routeLocale)
    }, [matchRoute])

    return locale
}
