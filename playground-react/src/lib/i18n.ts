import {defineMessages} from '@eviljs/std/i18n'
import it from './messages/it'
import en from './messages/en'

export const locale = 'en' as const
export const fallbackLocale = 'en' as const
export const messages = defineMessages({it, en})
export const I18nSpec = {locale, fallbackLocale, messages}

// Types ///////////////////////////////////////////////////////////////////////

export type I18nSpec = typeof I18nSpec
