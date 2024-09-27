import {compute} from '@eviljs/std/fn-compute'
import {
    createTranslator as createStdTranslator,
    t,
    translate,
    type Translator,
    type TranslatorDefinition,
    type TranslatorMessageArgValue,
    type TranslatorMessageArgs,
    type TranslatorMessageKey,
    type TranslatorMessages,
} from '@eviljs/std/translator'
import {isDefined} from '@eviljs/std/type-is'
import {createContext, createMemo, createSignal, useContext, type Accessor, type Context, type Setter} from 'solid-js'

export type * from '@eviljs/std/translator'

export const TranslatorContext: Context<undefined | Accessor<TranslatorManager<string, TranslatorMessageKey>>> = createContext<Accessor<TranslatorManager>>()

export function useTranslator(): Accessor<TranslatorManager<string, TranslatorMessageKey>> {
    return useContext(TranslatorContext)!
}

export function createTranslator(spec: TranslatorDefinition<string, TranslatorMessageKey>): Accessor<TranslatorManager<string, TranslatorMessageKey>> {
    const [locale, setLocale] = createSignal(spec.locale)
    const [localeFallback, setLocaleFallback] = createSignal(spec.localeFallback)
    const [messages, setMessages] = createSignal(spec.messages)

    const self = createMemo((): TranslatorManager<string, TranslatorMessageKey> => {
        const translator = createStdTranslator({
            ...spec,
            locale: locale(),
            localeFallback: localeFallback(),
            messages: messages(),
        })

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
                return locale()
            },
            set locale(value) {
                setLocale(value)
            },
            setLocale,
            get localeFallback() {
                return localeFallback()
            },
            set localeFallback(value) {
                setLocaleFallback(value)
            },
            setLocaleFallback,
            get messages() {
                return messages()
            },
            set messages(value) {
                setMessages(value)
            },
            setMessages,
        }
    }, [locale, localeFallback, messages])

    return self
}

export function createTranslatorMessage(
    getKey: TranslatorMessageKey | Accessor<string | TranslatorMessageKey>,
    getArgs?: undefined | TranslatorMessageArgs | Accessor<TranslatorMessageArgs>,
): Accessor<string | TranslatorMessageKey>
export function createTranslatorMessage(
    getKey: undefined | TranslatorMessageKey | Accessor<undefined | TranslatorMessageKey>,
    getArgs?: undefined | TranslatorMessageArgs | Accessor<TranslatorMessageArgs>,
): Accessor<undefined | string | TranslatorMessageKey>
export function createTranslatorMessage(
    getKey: undefined | TranslatorMessageKey | Accessor<undefined | TranslatorMessageKey>,
    getArgs?: undefined | TranslatorMessageArgs | Accessor<TranslatorMessageArgs>,
): Accessor<undefined | string | TranslatorMessageKey> {
    const context = useTranslator()

    const message = createMemo(() => {
        const key = compute(getKey)
        const args = compute(getArgs)

        return isDefined(key)
            ? context().translate(key, args)
            : undefined
    })

    return message
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TranslatorManager<L extends string = string, K extends TranslatorMessageKey = TranslatorMessageKey> extends Translator<L, K> {
    t(strings: TemplateStringsArray, ...substitutions: Array<TranslatorMessageArgValue>): string
    translate<KK extends K>(key: KK, values?: undefined | TranslatorMessageArgs): string | KK
    setLocale: Setter<L>
    setLocaleFallback: Setter<L>
    setMessages: Setter<TranslatorMessages<L, K>>
}
