import {
    createMsg,
    t,
    translate,
    type Msg,
    type MsgDefinition,
    type MsgMessageArgs,
    type MsgMessageArgValue,
    type MsgMessageKey,
    type MsgMessages,
} from '@eviljs/std/msg'
import {createElement, memo, useContext, useMemo, useState} from 'react'
import type {BoxProps} from './box.js'
import {classes} from './classes.js'
import {defineContext} from './ctx.js'
import type {StateSetter} from './state.js'
import type {VoidProps} from './type.js'

export type * from '@eviljs/std/msg'

export const MessageContext: React.Context<undefined | MessageStore<string, MsgMessageKey>> = defineContext<MessageStore>('MessageContext')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <MsgProvider locale={locale} localeFallback={localeFallback} messages={messages}>
*             <MyApp/>
*         </MsgProvider>
*     )
* }
*/
export function MessageProvider(props: MessageProviderProps): JSX.Element {
    const {children, ...spec} = props
    const contextValue = useMessageProvider(spec)

    return <MessageContext.Provider value={contextValue} children={children}/>
}

export const Message: React.ComponentType<MessageProps> = memo(function Message(props: MessageProps) {
    const {children, className, args, tag, ...otherProps} = props
    const message = useMessage(children, args)

    return (
        createElement(tag ?? 'span', {
            ...otherProps,
            className: classes('Message-cea2', className),
            'data-key': message !== children ? children : undefined,
        }, message)
    )
})

export function Translate(props: TranslateProps): React.ReactNode {
    const {children, args} = props
    const message = useMessage(children, args)

    return message
}

export function useMessageProvider(spec: MsgDefinition<string, MsgMessageKey>): MessageStore {
    const [locale, setLocale] = useState(spec.locale)
    const [localeFallback, setLocaleFallback] = useState(spec.localeFallback)
    const [messages, setMessages] = useState(spec.messages)

    const msg = useMemo((): MessageStore => {
        const msg = createMsg({...spec, locale, localeFallback, messages})

        return {
            __cache__: msg.__cache__,
            symbol: msg.symbol,
            t(...args) {
                return t(msg, ...args)
            },
            translate(...args) {
                return translate(msg, ...args)
            },
            get locale() {
                return locale
            },
            set locale(value) {
                setLocale(value)
            },
            setLocale,
            get localeFallback() {
                return localeFallback
            },
            set localeFallback(value) {
                setLocaleFallback(value)
            },
            setLocaleFallback,
            get messages() {
                return messages
            },
            set messages(value) {
                setMessages(value)
            },
            setMessages,
        }
    }, [locale, localeFallback, messages])

    return msg
}

export function useMessageContext<L extends string = string, K extends MsgMessageKey = MsgMessageKey>(): undefined | MessageStore<L, K> {
    return useContext(MessageContext)! as unknown as undefined | MessageStore<L, K>
}

export function useMessageStore<L extends string = string, K extends MsgMessageKey = MsgMessageKey>(): MessageStore<L, K> {
    return useMessageContext()!
}

export function useMessage<K extends MsgMessageKey = MsgMessageKey>(key: K, args?: undefined | MsgMessageArgs): string | K {
    const {translate} = useMessageStore()

    const message = useMemo(() => {
        return translate(key, args)
    }, [translate, key, args])

    return message
}

export function useMessages<T extends object, L extends string = string, K extends MsgMessageKey = MsgMessageKey>(
    compute: MessagesComputer<MessageStore<L, K>, T>,
    deps?: undefined | Array<unknown>,
): T & { $msg: MessageStore<L, K> } {
    const msg = useMessageStore()! as MessageStore<L, K>
    const {locale, localeFallback, messages} = msg

    const messagesComputed = useMemo(() => {
        return {
            ...compute(msg),
            $msg: msg,
        }
    }, [msg, locale, localeFallback, messages, ...deps ?? []])

    return messagesComputed
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MessageProviderProps extends MsgDefinition<string, string> {
    children: undefined | React.ReactNode
}

export interface MessageStore<L extends string = string, K extends MsgMessageKey = MsgMessageKey> extends Msg<L, K> {
    t(strings: TemplateStringsArray, ...substitutions: Array<MsgMessageArgValue>): string
    translate<KK extends K>(key: KK, values?: undefined | MsgMessageArgs): string | KK
    setLocale: StateSetter<L>
    setLocaleFallback: StateSetter<L>
    setMessages: StateSetter<MsgMessages<L, K>>
}

export interface MessageProps extends VoidProps<BoxProps>, TranslateProps {
}

export interface TranslateProps {
    args?: undefined | MsgMessageArgs
    children: MsgMessageKey
}

export interface MessagesComputer<I, T extends object> {
    (i18n: I): T
}
