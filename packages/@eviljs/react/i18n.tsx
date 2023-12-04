import type {I18nMessageKey} from '@eviljs/std/i18n.js'
import {useMemo} from 'react'
import {useI18nContext, type I18nManager} from './i18n-provider.js'

export type * from '@eviljs/std/i18n.js'
export * from './i18n-provider.js'

export function useI18n<L extends string = string, K extends I18nMessageKey = I18nMessageKey>(): I18nManager<L, K> {
    return useI18nContext()!
}

export function useI18nMsg<T extends object, L extends string = string, K extends I18nMessageKey = I18nMessageKey>(
    compute: I18nMsgsComputer<I18nManager<L, K>, T>,
    deps?: undefined | Array<unknown>,
) {
    const i18n = useI18n()! as I18nManager<L, K>
    const {locale, localeFallback, messages} = i18n

    const i18nMsg = useMemo(() => {
        return {
            ...compute(i18n),
            $i18n: i18n,
        }
    }, [i18n, locale, localeFallback, messages, ...deps ?? []])

    return i18nMsg
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18nMsgsComputer<I, T extends object> {
    (i18n: I): T
}
