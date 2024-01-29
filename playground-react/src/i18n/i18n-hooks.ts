import {useI18n as useStdI18n} from '@eviljs/react/i18n'
import type {I18nLocale, I18nMessageKey} from '~/i18n/i18n-apis'

export {useI18nMessage, useI18nMessages} from '@eviljs/react/i18n'
export const useI18n = useStdI18n<I18nLocale, I18nMessageKey>
