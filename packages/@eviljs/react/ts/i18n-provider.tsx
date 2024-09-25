import {
    createI18n,
    t,
    translate,
    type I18n,
    type I18nDefinition,
    type I18nMessageArgValue,
    type I18nMessageArgs,
    type I18nMessageKey,
    type I18nMessages,
} from '@eviljs/std/i18n.js'
import {useContext, useMemo, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateSetter} from './state.js'

export const I18nContext: React.Context<undefined | I18nManager<string, I18nMessageKey>> = defineContext<I18nManager>('I18nContext')

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
export function I18nProvider(props: I18nProviderProps): JSX.Element {
    const {children, ...spec} = props
    const contextValue = useI18nProvider(spec)

    return <I18nContext.Provider value={contextValue} children={children}/>
}

export function useI18nProvider(spec: I18nDefinition<string, I18nMessageKey>): I18nManager {
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

export function useI18nContext<L extends string = string, K extends I18nMessageKey = I18nMessageKey>(): undefined | I18nManager<L, K> {
    return useContext(I18nContext)! as unknown as undefined | I18nManager<L, K>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nProviderProps extends I18nDefinition<string, string> {
    children: undefined | React.ReactNode
}

export interface I18nManager<L extends string = string, K extends I18nMessageKey = I18nMessageKey> extends I18n<L, K> {
    t(strings: TemplateStringsArray, ...substitutions: Array<I18nMessageArgValue>): string
    translate<KK extends K>(key: KK, values?: undefined | I18nMessageArgs): string | KK
    setLocale: StateSetter<L>
    setLocaleFallback: StateSetter<L>
    setMessages: StateSetter<I18nMessages<L, K>>
}
