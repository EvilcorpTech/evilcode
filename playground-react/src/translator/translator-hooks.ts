import {useTranslator as useStdTranslator} from '@eviljs/react/translator'
import type {DemoLocale} from '~/l10n/locale-services'
import type {DemoMessageKey} from '~/translator/translator-specs'

export {useTranslatorMessage, useTranslatorMessages} from '@eviljs/react/translator'
export const useTranslator = useStdTranslator<DemoLocale, DemoMessageKey>
