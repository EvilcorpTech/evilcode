import type {I18nMessageArgs} from '@eviljs/std/i18n.js'
import {isString} from '@eviljs/std/type-is.js'
import type {Accessor, JSX} from 'solid-js'
import {Show, splitProps} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {classes} from './classes.js'
import {createI18nMessage} from './i18n.js'

export function Message(props: MessageProps): JSX.Element {
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
                children={message()}
            />
        </Show>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MessageProps extends JSX.HTMLAttributes<HTMLElement> {
    args?: undefined | I18nMessageArgs | Accessor<I18nMessageArgs>
    children: undefined | string
    tag?: undefined | keyof JSX.IntrinsicElements
}
