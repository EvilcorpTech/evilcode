import {useMessageStore as useStdMessageStore} from '@eviljs/react/message'
import type {DemoLocale} from '/l10n/locale-services'
import type {DemoMessageKey} from '/message/message-specs'

export {useMessage, useMessages} from '@eviljs/react/message'
export const useMessageStore = useStdMessageStore<DemoLocale, DemoMessageKey>
