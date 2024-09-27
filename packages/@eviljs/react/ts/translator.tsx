import type {TranslatorMessageArgs, TranslatorMessageKey} from '@eviljs/std/translator'
import {useMemo} from 'react'
import {useTranslatorContext, type TranslatorManager} from './translator-provider.js'

export type * from '@eviljs/std/translator'
export * from './translator-provider.js'

export function useTranslator<L extends string = string, K extends TranslatorMessageKey = TranslatorMessageKey>(): TranslatorManager<L, K> {
    return useTranslatorContext()!
}

export function useTranslatorMessage<K extends TranslatorMessageKey = TranslatorMessageKey>(key: K, args?: undefined | TranslatorMessageArgs): string | K {
    const {translate} = useTranslator()

    const message = useMemo(() => {
        return translate(key, args)
    }, [translate, key, args])

    return message
}

export function useTranslatorMessages<T extends object, L extends string = string, K extends TranslatorMessageKey = TranslatorMessageKey>(
    compute: TranslatorMessagesComputer<TranslatorManager<L, K>, T>,
    deps?: undefined | Array<unknown>,
): T & { $translator: TranslatorManager<L, K> } {
    const translator = useTranslator()! as TranslatorManager<L, K>
    const {locale, localeFallback, messages} = translator

    const messagesComputed = useMemo(() => {
        return {
            ...compute(translator),
            $translator: translator,
        }
    }, [translator, locale, localeFallback, messages, ...deps ?? []])

    return messagesComputed
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TranslatorMessagesComputer<I, T extends object> {
    (i18n: I): T
}
