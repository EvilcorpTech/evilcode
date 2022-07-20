import {I18n as EvilI18n, useI18n as useEvilI18n} from '@eviljs/react/i18n'
import type {I18nKeyOf, I18nLocaleOf} from '@eviljs/std/i18n'
import type {I18nSpec} from '../i18n'

export {useI18nMsg} from '@eviljs/react/i18n'
export const useI18n = useEvilI18n<I18n>

// Types ///////////////////////////////////////////////////////////////////////

export type I18n = EvilI18n<I18nLocaleOf<I18nSpec>, I18nKeyOf<I18nSpec>>
