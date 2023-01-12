import {defineI18n} from '@eviljs/std/i18n'
import it from '~/messages/it'
import en from '~/messages/en'

export const I18nDefaultLocale = 'en'
export const I18nDefaultFallbackLocale = 'en'
export const I18nDefaultMessages = {it, en}

export const I18nSpec = defineI18n({
    locale: I18nDefaultLocale,
    fallbackLocale: I18nDefaultFallbackLocale,
    messages: I18nDefaultMessages,
})


// Types ///////////////////////////////////////////////////////////////////////

export type I18nSpec = typeof I18nSpec
