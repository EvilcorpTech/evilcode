import type {MsgValues} from '@eviljs/std/i18n.js'
import {isString} from '@eviljs/std/type.js'
import type {Accessor, JSX} from 'solid-js'
import {Show, splitProps} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {classes} from './classes.js'
import {createI18nMessage} from './i18n.js'

export function Text(props: TextProps) {
    const [_, otherProps] = splitProps(props, ['args', 'children', 'tag'])

    const message = createI18nMessage(
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
                children={message}
            />
        </Show>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TextProps extends JSX.HTMLAttributes<HTMLElement> {
    args?: undefined | MsgValues | Accessor<MsgValues>
    children: undefined | string
    tag?: undefined | keyof JSX.IntrinsicElements
}
