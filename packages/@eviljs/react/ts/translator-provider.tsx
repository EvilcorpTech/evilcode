import {
    createTranslator,
    t,
    translate,
    type Translator,
    type TranslatorDefinition,
    type TranslatorMessageArgValue,
    type TranslatorMessageArgs,
    type TranslatorMessageKey,
    type TranslatorMessages,
} from '@eviljs/std/translator'
import {useContext, useMemo, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateSetter} from './state.js'

export const TranslatorContext: React.Context<undefined | TranslatorManager<string, TranslatorMessageKey>> = defineContext<TranslatorManager>('TranslatorContext')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <TranslatorProvider locale={locale} localeFallback={localeFallback} messages={messages}>
*             <MyApp/>
*         </TranslatorProvider>
*     )
* }
*/
export function TranslatorProvider(props: TranslatorProviderProps): JSX.Element {
    const {children, ...spec} = props
    const contextValue = useTranslatorProvider(spec)

    return <TranslatorContext.Provider value={contextValue} children={children}/>
}

export function useTranslatorProvider(spec: TranslatorDefinition<string, TranslatorMessageKey>): TranslatorManager {
    const [locale, setLocale] = useState(spec.locale)
    const [localeFallback, setLocaleFallback] = useState(spec.localeFallback)
    const [messages, setMessages] = useState(spec.messages)

    const translator = useMemo((): TranslatorManager => {
        const translator = createTranslator({...spec, locale, localeFallback, messages})

        return {
            __cache__: translator.__cache__,
            symbol: translator.symbol,
            t(...args) {
                return t(translator, ...args)
            },
            translate(...args) {
                return translate(translator, ...args)
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

    return translator
}

export function useTranslatorContext<L extends string = string, K extends TranslatorMessageKey = TranslatorMessageKey>(): undefined | TranslatorManager<L, K> {
    return useContext(TranslatorContext)! as unknown as undefined | TranslatorManager<L, K>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TranslatorProviderProps extends TranslatorDefinition<string, string> {
    children: undefined | React.ReactNode
}

export interface TranslatorManager<L extends string = string, K extends TranslatorMessageKey = TranslatorMessageKey> extends Translator<L, K> {
    t(strings: TemplateStringsArray, ...substitutions: Array<TranslatorMessageArgValue>): string
    translate<KK extends K>(key: KK, values?: undefined | TranslatorMessageArgs): string | KK
    setLocale: StateSetter<L>
    setLocaleFallback: StateSetter<L>
    setMessages: StateSetter<TranslatorMessages<L, K>>
}
