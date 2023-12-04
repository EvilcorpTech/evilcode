import type {I18nDefinition} from '@eviljs/std/i18n'
import en from '~/messages/en'
import it from '~/messages/it'

export const I18nDefaultLocale = 'en'
export const I18nDefaultLocaleFallback = 'en'
export const I18nDefaultMessages = {it, en}
export const I18nLocales = Object.keys(I18nDefaultMessages) as Array<I18nLocale>

export const I18nSpec: I18nDefinition<I18nLocale, I18nMessageKey> = {
    locale: I18nDefaultLocale,
    localeFallback: I18nDefaultLocaleFallback,
    messages: I18nDefaultMessages,
}

// Types ///////////////////////////////////////////////////////////////////////

export type I18nLocale = keyof typeof I18nDefaultMessages
export type I18nMessageKey = keyof typeof it | keyof typeof en
