import {useContainer as useContainerStd} from '@eviljs/react/container'
import {useI18n as useI18nStd, useI18nMsg as useI18nMsgStd, I18n as I18nStd, I18nMsgsComputer} from '@eviljs/react/i18n'
import {I18nKeyOf, I18nLocaleOf} from '@eviljs/std/i18n'
import {Container} from './container'
import {I18nSpec} from './i18n'

export function useContainer() {
    return useContainerStd() as Container
}

export function useI18n() {
    return useI18nStd() as I18n
}

export function useI18nMsg<T extends {}>(compute: I18nMsgsComputer<I18n, T>, deps?: Array<unknown>) {
    return useI18nMsgStd<I18n, T>(compute, deps)
}

// Types ///////////////////////////////////////////////////////////////////////

export type I18n = I18nStd<I18nLocaleOf<I18nSpec>, I18nKeyOf<I18nSpec>>
