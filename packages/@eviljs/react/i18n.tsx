import type {I18n, I18nDefinition, I18nMessageArgValue, I18nMessageArgs, I18nMessageKey, I18nMessages} from '@eviljs/std/i18n.js'
import {createI18n, t, translate} from '@eviljs/std/i18n.js'
import {useContext, useMemo, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateSetter} from './state.js'

export type * from '@eviljs/std/i18n.js'
export const I18nContext = defineContext<I18nManager>('I18nContext')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <I18nProvider locale={locale} localeFallback={localeFallback} messages={messages}>
*             <MyApp/>
*         </I18nProvider>
*     )
* }
*/
export function I18nProvider(props: I18nProviderProps) {
    const {children, ...spec} = props
    const value = useI18nCreator(spec)

    return <I18nContext.Provider value={value} children={children}/>
}

export function useI18nCreator(spec: I18nDefinition<string, I18nMessageKey>) {
    const [locale, setLocale] = useState(spec.locale)
    const [localeFallback, setLocaleFallback] = useState(spec.localeFallback)
    const [messages, setMessages] = useState(spec.messages)

    const i18nManager = useMemo((): I18nManager => {
        const i18n = createI18n({...spec, locale, localeFallback, messages})

        return {
            __cache__: i18n.__cache__,
            symbol: i18n.symbol,
            t(...args) {
                return t(i18n, ...args)
            },
            translate(...args) {
                return translate(i18n, ...args)
            },
            get locale() {
                return locale
            },
            set locale(value) {
                setLocale(value)
            },
            setLocale,
            get localeFallback() {
                return localeFallback
            },
            set localeFallback(value) {
                setLocaleFallback(value)
            },
            setLocaleFallback,
            get messages() {
                return messages
            },
            set messages(value) {
                setMessages(value)
            },
            setMessages,
        }
    }, [locale, localeFallback, messages])

    return i18nManager
}

export function useI18n<L extends string = string, K extends I18nMessageKey = I18nMessageKey>() {
    return useContext(I18nContext) as undefined | I18nManager<L, K>
}

export function useI18nMsg<T extends object, L extends string = string, K extends I18nMessageKey = I18nMessageKey>(
    compute: I18nMsgsComputer<I18nManager<L, K>, T>,
    deps?: undefined | Array<unknown>,
) {
    const i18n = useI18n()! as I18nManager<L, K>
    const {locale, localeFallback, messages} = i18n

    const i18nMsg = useMemo(() => {
        return {
            ...compute(i18n),
            $i18n: i18n,
        }
    }, [i18n, locale, localeFallback, messages, ...deps ?? []])

    return i18nMsg
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nProviderProps extends I18nDefinition<string, string> {
    children: undefined | React.ReactNode
}

export interface I18nMsgsComputer<I, T extends object> {
    (i18n: I): T
}

export interface I18nManager<L extends string = string, K extends I18nMessageKey = I18nMessageKey> extends I18n<L, K> {
    t(strings: TemplateStringsArray, ...substitutions: Array<I18nMessageArgValue>): string
    translate<KK extends K>(key: KK, values?: undefined | I18nMessageArgs): string | KK
    setLocale: StateSetter<L>
    setLocaleFallback: StateSetter<L>
    setMessages: StateSetter<I18nMessages<L, K>>
}
