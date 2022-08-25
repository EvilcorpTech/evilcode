import {createI18n, I18n, I18nMessages} from '@eviljs/std/i18n.js'
import {useContext, useMemo, useState} from 'react'
import {defineContext} from './ctx.js'

export const I18nContext = defineContext<I18nManager>('I18nContext')

/*
* EXAMPLE
*
* const spec = {locale, fallbackLocale, messages}
* const i18n = createI18n(spec)
* const Main = WithI18n(MyMain, i18n)
*
* render(<Main/>, document.body)
*/
export function WithI18n<P extends {}>(Child: React.ComponentType<P>, spec: I18nManager) {
    function I18nProviderProxy(props: P) {
        return withI18n(<Child {...props}/>, spec)
    }

    return I18nProviderProxy
}

/*
* EXAMPLE
*
* const spec = {locale, fallbackLocale, messages}
* const i18n = createI18n(spec)
*
* export function MyMain(props) {
*     return withI18n(<Children/>, i18n)
* }
*/
export function withI18n(children: React.ReactNode, spec: I18n) {
    const [locale, setLocale] = useState(spec.locale)
    const [fallbackLocale, setFallbackLocale] = useState(spec.fallbackLocale)
    const [messages, setMessages] = useState(spec.messages)

    const i18n = useMemo(() => {
        const self: I18nManager = {
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
* const spec = {locale, fallbackLocale, messages}
* const i18n = createI18n(spec)
*
* export function MyMain(props) {
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

export function useI18n<T extends undefined | I18nManager = undefined | I18nManager>() {
    return useContext(I18nContext) as T
}

export function useI18nMsg<I extends I18nManager, T extends {}>(
    compute: I18nMsgsComputer<I, T>,
    deps?: undefined | Array<unknown>,
) {
    const i18n = useI18n() as I
    const {locale, fallbackLocale, messages} = i18n

    const i18nMsg = useMemo(() => {
        return {
            ...compute(i18n),
            $i18n: i18n,
        }
    }, [i18n, locale, fallbackLocale, messages, ...(deps ?? [])])

    return i18nMsg
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nProviderProps {
    children: React.ReactNode
    i18n: I18nManager
}

export interface I18nMsgsComputer<I extends I18nManager, T extends {}> {
    (i18n: I): T
}

export interface I18nManager<L extends string = string, K extends string = string> extends I18n<L, K>, I18nSetters<L, K> {
}

export interface I18nSetters<L extends string = string, K extends string = string> {
    setLocale(value: L): void
    setFallbackLocale(value: L): void
    setMessages(value: I18nMessages<L, K>): void
}
