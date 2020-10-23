import {createI18n, I18n as StdI18n, I18nMessages} from '@eviljs/std-lib/i18n.js'
import React from 'react'
const {createContext, useContext, useMemo, useState} = React

export const I18nContext = createContext<I18n>(void undefined as any)

I18nContext.displayName = 'StdI18nContext'

/*
* EXAMPLE
*
* const spec = {locale, fallbackLocale, messages}
* const i18n = createI18n(spec)
* const main = WithI18n(MyMain, i18n)
*
* render(<main/>, document.body)
*/
export function WithI18n(Child: React.ElementType, spec: I18n) {
    function I18nProviderProxy(props: any) {
        return withI18n(<Child {...props}/>, spec)
    }

    return I18nProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {locale, fallbackLocale, messages}
*     const i18n = createI18n(spec)
*     const main = withI18n(<MyMain/>, i18n)
*
*     return <main/>
* }
*/
export function withI18n(children: React.ReactNode, spec: StdI18n) {
    const [locale, setLocale] = useState(spec.locale)
    const [fallbackLocale, setFallbackLocale] = useState(spec.fallbackLocale)
    const [messages, setMessages] = useState(spec.messages)

    const i18n = useMemo(() => {
        const self: I18n = {
            ...createI18n({
                locale: locale,
                fallbackLocale: fallbackLocale,
                messages: messages,
            }),
            get locale() {
                return locale
            },
            set locale(value) {
                setLocale(value)
            },
            setLocale,
            get fallbackLocale() {
                return fallbackLocale
            },
            set fallbackLocale(value) {
                setFallbackLocale(value)
            },
            setFallbackLocale,
            get messages() {
                return messages
            },
            set messages(value) {
                setMessages(value)
            },
            setMessages,
        }

        return self
    }, [locale, fallbackLocale, messages])

    return (
        <I18nContext.Provider value={i18n}>
            {children}
        </I18nContext.Provider>
    )
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {locale, fallbackLocale, messages}
*     const i18n = createI18n(spec)
*
*     return (
*         <I18nProvider i18n={i18n}>
*             <MyApp/>
*         </I18nProvider>
*     )
* }
*/
export function I18nProvider(props: I18nProviderProps) {
    return withI18n(props.children, props.i18n)
}

export function useI18n() {
    return useContext(I18nContext)
}

export function useI18nMsg<T>(compute: I18nMsgsComputer<T>, deps: Array<unknown> = []) {
    const i18n = useI18n()
    const {locale, fallbackLocale, messages} = i18n

    const i18nMsg = useMemo(() => {
        return {
            ...compute(i18n),
            $i18n: i18n,
        }
    }, [i18n, locale, fallbackLocale, messages, ...deps])

    return i18nMsg
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nProviderProps {
    children: React.ReactNode
    i18n: I18n
}

export interface I18nMsgsComputer<T> {
    (i18n: I18n): T
}

export interface I18n extends StdI18n, I18nSetters {
}

export interface I18nSetters {
    setLocale(value: string): void
    setFallbackLocale(value: string): void
    setMessages(value: I18nMessages): void
}
