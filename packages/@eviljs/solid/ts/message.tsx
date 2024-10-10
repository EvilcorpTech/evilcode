import {compute} from '@eviljs/std/fn-compute'
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
import {isDefined, isString} from '@eviljs/std/type-is'
import {createContext, createMemo, createSignal, Show, splitProps, useContext, type Accessor, type Context, type JSX, type Setter} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {classes} from './classes.js'

export type * from '@eviljs/std/msg'

export const MessageContext: Context<undefined | Accessor<MessageStore<string, MsgMessageKey>>> = createContext<Accessor<MessageStore>>()

export function Message(props: MessageProps): JSX.Element {
    const [_, otherProps] = splitProps(props, ['args', 'children', 'tag'])

    const message = createMessage(
        () => isString(props.children)
            ? props.children
            : undefined
        ,
        props.args,
    )

    return (
        <Show when={message()}>
            <Dynamic
                {...otherProps}
                component={props.tag ?? 'span'}
                class={classes('Text-6e34', props.class)}
                data-key={message() !== props.children
                    ? props.children
                    : undefined
                }
                children={message()}
            />
        </Show>
    )
}

export function useMessageStore(): Accessor<MessageStore<string, MsgMessageKey>> {
    return useContext(MessageContext)!
}

export function createMessageStore(spec: MsgDefinition<string, MsgMessageKey>): Accessor<MessageStore<string, MsgMessageKey>> {
    const [locale, setLocale] = createSignal(spec.locale)
    const [localeFallback, setLocaleFallback] = createSignal(spec.localeFallback)
    const [messages, setMessages] = createSignal(spec.messages)

    const self = createMemo((): MessageStore<string, MsgMessageKey> => {
        const msg = createMsg({
            ...spec,
            locale: locale(),
            localeFallback: localeFallback(),
            messages: messages(),
        })

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
                return locale()
            },
            set locale(value) {
                setLocale(value)
            },
            setLocale,
            get localeFallback() {
                return localeFallback()
            },
            set localeFallback(value) {
                setLocaleFallback(value)
            },
            setLocaleFallback,
            get messages() {
                return messages()
            },
            set messages(value) {
                setMessages(value)
            },
            setMessages,
        }
    }, [locale, localeFallback, messages])

    return self
}

export function createMessage(
    getKey: MsgMessageKey | Accessor<string | MsgMessageKey>,
    getArgs?: undefined | MsgMessageArgs | Accessor<MsgMessageArgs>,
): Accessor<string | MsgMessageKey>
export function createMessage(
    getKey: undefined | MsgMessageKey | Accessor<undefined | MsgMessageKey>,
    getArgs?: undefined | MsgMessageArgs | Accessor<MsgMessageArgs>,
): Accessor<undefined | string | MsgMessageKey>
export function createMessage(
    getKey: undefined | MsgMessageKey | Accessor<undefined | MsgMessageKey>,
    getArgs?: undefined | MsgMessageArgs | Accessor<MsgMessageArgs>,
): Accessor<undefined | string | MsgMessageKey> {
    const context = useMessageStore()

    const message = createMemo(() => {
        const key = compute(getKey)
        const args = compute(getArgs)

        return isDefined(key)
            ? context().translate(key, args)
            : undefined
    })

    return message
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MessageStore<L extends string = string, K extends MsgMessageKey = MsgMessageKey> extends Msg<L, K> {
    t(strings: TemplateStringsArray, ...substitutions: Array<MsgMessageArgValue>): string
    translate<KK extends K>(key: KK, values?: undefined | MsgMessageArgs): string | KK
    setLocale: Setter<L>
    setLocaleFallback: Setter<L>
    setMessages: Setter<MsgMessages<L, K>>
}

export interface MessageProps extends JSX.HTMLAttributes<HTMLElement> {
    args?: undefined | MsgMessageArgs | Accessor<MsgMessageArgs>
    children: undefined | string
    tag?: undefined | keyof JSX.IntrinsicElements
}
