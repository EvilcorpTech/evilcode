import {compute} from '@eviljs/std/fn-compute.js'
import {createI18n as createStdI18n, t, translate, type I18n, type I18nDefinition, type I18nMessageArgValue, type I18nMessageArgs, type I18nMessageKey, type I18nMessages} from '@eviljs/std/i18n.js'
import {isDefined} from '@eviljs/std/type-is.js'
import {createContext, createMemo, createSignal, useContext, type Accessor, type Setter} from 'solid-js'

export type * from '@eviljs/std/i18n.js'

export const I18nContext = createContext<Accessor<I18nManager>>()

export function useI18n() {
    return useContext(I18nContext)!
}

export function createI18n(spec: I18nDefinition<string, I18nMessageKey>) {
    const [locale, setLocale] = createSignal(spec.locale)
    const [localeFallback, setLocaleFallback] = createSignal(spec.localeFallback)
    const [messages, setMessages] = createSignal(spec.messages)

    const i18nManager = createMemo((): I18nManager<string, I18nMessageKey> => {
        const i18n = createStdI18n({
            ...spec,
            locale: locale(),
            localeFallback: localeFallback(),
            messages: messages(),
        })

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

    return i18nManager
}

export function createI18nMessage(
    getKey: I18nMessageKey | Accessor<string | I18nMessageKey>,
    getArgs?: undefined | I18nMessageArgs | Accessor<I18nMessageArgs>,
): Accessor<string | I18nMessageKey>
export function createI18nMessage(
    getKey: undefined | I18nMessageKey | Accessor<undefined | I18nMessageKey>,
    getArgs?: undefined | I18nMessageArgs | Accessor<I18nMessageArgs>,
): Accessor<undefined | string | I18nMessageKey>
export function createI18nMessage(
    getKey: undefined | I18nMessageKey | Accessor<undefined | I18nMessageKey>,
    getArgs?: undefined | I18nMessageArgs | Accessor<I18nMessageArgs>,
): Accessor<undefined | string | I18nMessageKey> {
    const i18n = useI18n()

    const message = createMemo(() => {
        const key = compute(getKey)
        const args = compute(getArgs)

        return isDefined(key)
            ? i18n().translate(key, args)
            : undefined
    })

    return message
}

// Types ///////////////////////////////////////////////////////////////////////

export type I18nState = I18n<string, string>

export interface I18nManager<L extends string = string, K extends I18nMessageKey = I18nMessageKey> extends I18n<L, K> {
    t(strings: TemplateStringsArray, ...substitutions: Array<I18nMessageArgValue>): string
    translate<KK extends K>(key: KK, values?: undefined | I18nMessageArgs): string | KK
    setLocale: Setter<L>
    setLocaleFallback: Setter<L>
    setMessages: Setter<I18nMessages<L, K>>
}
