import {defineMessages} from '@eviljs/std/i18n'
import it from './messages/it'
import en from './messages/en'

export const locale = 'en'
export const fallbackLocale = 'en'
export const messages = defineMessages({it, en})
export const I18nSpec = {locale, fallbackLocale, messages}
