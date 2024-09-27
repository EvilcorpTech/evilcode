import type {TranslatorDefinition} from '@eviljs/std/translator'
import {DemoLocaleDefault, DemoLocaleFallback, type DemoLocale} from '~/l10n/locale-services'
import en from '~/messages/en'
import it from '~/messages/it'

export const TranslatorDefaultMessages = {it, en}

export const TranslatorSpec: TranslatorDefinition<DemoLocale, DemoMessageKey> = {
    locale: DemoLocaleDefault,
    localeFallback: DemoLocaleFallback,
    messages: TranslatorDefaultMessages,
}

// Types ///////////////////////////////////////////////////////////////////////

export type DemoMessageKey = keyof typeof it | keyof typeof en
