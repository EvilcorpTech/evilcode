import {I18n as EvilI18n} from '@eviljs/react/i18n'
import {I18nKeyOf, I18nLocaleOf} from '@eviljs/std/i18n'
import {I18nSpec} from '../i18n'

export {useI18n, useI18nMsg} from '@eviljs/react/i18n'

// Types ///////////////////////////////////////////////////////////////////////

export type I18n = EvilI18n<I18nLocaleOf<I18nSpec>, I18nKeyOf<I18nSpec>>
