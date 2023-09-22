import {defineI18n} from '@eviljs/std/i18n'
import it from '~/messages/it'
import en from '~/messages/en'

export const I18nDefaultLocale = 'en'
export const I18nDefaultLocaleFallback = 'en'
export const I18nDefaultMessages = {it, en}
export const I18nLocales = Object.keys(I18nDefaultMessages) as Array<I18nLocale>

export const I18nSpec = defineI18n({
    locale: I18nDefaultLocale,
    localeFallback: I18nDefaultLocaleFallback,
    messages: I18nDefaultMessages,
})


// Types ///////////////////////////////////////////////////////////////////////

export type I18nSpec = typeof I18nSpec
export type I18nLocale = keyof typeof I18nDefaultMessages
