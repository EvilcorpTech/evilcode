import {compute} from '@eviljs/std/compute.js'
import type {I18n, I18nMessageValues, I18nMessages, I18nSpec} from '@eviljs/std/i18n.js'
import {createI18n as createStdI18n} from '@eviljs/std/i18n.js'
import type {Accessor, Setter} from 'solid-js'
import {createContext, createMemo, createSignal, useContext} from 'solid-js'

export const I18nContext = createContext<Accessor<I18nManager>>()

export function useI18n() {
    return useContext(I18nContext)
}

export function createI18n(spec: I18nSpec<string, string, string, string>) {
    const [locale, setLocale] = createSignal(spec.locale)
    const [localeFallback, setLocaleFallback] = createSignal(spec.localeFallback)
    const [messages, setMessages] = createSignal(spec.messages)

    const i18n = createMemo((): I18nManager => {
        const manager = createStdI18n({
            ...spec,
            locale: locale(),
            localeFallback: localeFallback(),
            messages: messages(),
        })

        return {
            symbol: manager.symbol,
            format: manager.format,
            t: manager.t,
            translate: manager.translate,
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

    return i18n
}

export function createI18nMessage(
    getId: string | Accessor<string>,
    getArgs?: undefined | I18nMessageValues | Accessor<I18nMessageValues>,
): Accessor<string>
export function createI18nMessage(
    getId: undefined | string | Accessor<undefined | string>,
    getArgs?: undefined | I18nMessageValues | Accessor<I18nMessageValues>,
): Accessor<undefined | string>
export function createI18nMessage(
    getId: undefined | string | Accessor<undefined | string>,
    getArgs?: undefined | I18nMessageValues | Accessor<I18nMessageValues>,
): Accessor<undefined | string> {
    const i18n = useI18n()!

    const message = createMemo(() => {
        const id = compute(getId)
        const args = compute(getArgs)

        return id
            ? i18n().translate(id, args)
            : undefined
    })

    return message
}

// Types ///////////////////////////////////////////////////////////////////////

export type I18nState = I18n<string, string>

export interface I18nManager<L extends string = string, K extends string = string> extends
    Omit<I18n<L, K>, '__regexpCache__'>,
    I18nSetters<L, K>
{
}

export interface I18nSetters<L extends string = string, K extends string = string> {
    setLocale: Setter<L>
    setLocaleFallback: Setter<L>
    setMessages: Setter<I18nMessages<L, K>>
}
