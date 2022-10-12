import {I18nManager, useI18n as useCoreI18n} from '@eviljs/react/i18n'
import type {I18nKeyOf, I18nLocaleOf} from '@eviljs/std/i18n'
import type {I18nSpec} from './apis'

export {useI18nMsg} from '@eviljs/react/i18n'
export const useI18n = useCoreI18n<I18nLocaleOf<I18nSpec>, I18nKeyOf<I18nSpec>>

// Types ///////////////////////////////////////////////////////////////////////

export type I18n = I18nManager<I18nLocaleOf<I18nSpec>, I18nKeyOf<I18nSpec>>
