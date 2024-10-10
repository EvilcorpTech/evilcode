import type {MsgDefinition} from '@eviljs/std/msg'
import {DemoLocaleDefault, DemoLocaleFallback, type DemoLocale} from '~/l10n/locale-services'
import en from '~/messages/en'
import it from '~/messages/it'

export const MsgDefaultMessages = {it, en}

export const MsgSpec: MsgDefinition<DemoLocale, DemoMessageKey> = {
    locale: DemoLocaleDefault,
    localeFallback: DemoLocaleFallback,
    messages: MsgDefaultMessages,
}

// Types ///////////////////////////////////////////////////////////////////////

export type DemoMessageKey = keyof typeof it | keyof typeof en
