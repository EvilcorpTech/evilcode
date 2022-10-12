import {defineI18n} from '@eviljs/std/i18n'
import it from '~/messages/it'
import en from '~/messages/en'

export const I18nSpec = defineI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {it, en},
})

// Types ///////////////////////////////////////////////////////////////////////

export type I18nSpec = typeof I18nSpec
