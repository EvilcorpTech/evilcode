import type {I18n, I18nMessages, I18nSpec} from '@eviljs/std/i18n.js'
import {createI18n} from '@eviljs/std/i18n.js'
import {useContext, useMemo, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateSetter} from './state.js'

export type {MsgValues} from '@eviljs/std/i18n.js'
export const I18nContext = defineContext<I18nManager>('I18nContext')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <I18nProvider locale={locale} fallbackLocale={fallbackLocale} messages={messages}>
*             <MyApp/>
*         </I18nProvider>
*     )
* }
*/
export function I18nProvider(props: I18nProviderProps) {
    const {children, ...spec} = props

    return (
        <I18nContext.Provider value={useRootI18n(spec)}>
            {children}
        </I18nContext.Provider>
    )
}

export function useRootI18n(spec: I18nSpec<string, string, string, string>) {
    const [locale, setLocale] = useState(spec.locale)
    const [fallbackLocale, setFallbackLocale] = useState(spec.fallbackLocale)
    const [messages, setMessages] = useState(spec.messages)

    const i18n = useMemo((): I18nManager => {
        const manager = createI18n({...spec, locale, fallbackLocale, messages})

        return {
            symbol: manager.symbol,
            format: manager.format,
            t: manager.t,
            translate: manager.translate,
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
    }, [locale, fallbackLocale, messages])

    return i18n
}

export function useI18n<L extends string = string, K extends string = string>() {
    return useContext(I18nContext) as undefined | I18nManager<L, K>
}

export function useI18nMsg<T extends object, L extends string = string, K extends string = string>(
    compute: I18nMsgsComputer<I18nManager<L, K>, T>,
    deps?: undefined | Array<unknown>,
) {
    const i18n = useI18n()! as I18nManager<L, K>
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

export interface I18nProviderProps extends I18nSpec<string, string, string, string> {
    children: undefined | React.ReactNode
}

export interface I18nMsgsComputer<I, T extends object> {
    (i18n: I): T
}

export interface I18nManager<L extends string = string, K extends string = string> extends
    Omit<I18n<L, K>, '__regexpCache__'>,
    I18nSetters<L, K>
{
}

export interface I18nSetters<L extends string = string, K extends string = string> {
    setLocale: StateSetter<L>
    setFallbackLocale: StateSetter<L>
    setMessages: StateSetter<I18nMessages<L, K>>
}
