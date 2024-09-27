import type {TranslatorMessageArgs} from '@eviljs/std/translator'
import {isString} from '@eviljs/std/type-is'
import type {Accessor, JSX} from 'solid-js'
import {Show, splitProps} from 'solid-js'
import {Dynamic} from 'solid-js/web'
import {classes} from './classes.js'
import {createTranslatorMessage} from './translator.js'

export function Message(props: MessageProps): JSX.Element {
    const [_, otherProps] = splitProps(props, ['args', 'children', 'tag'])

    const message = createTranslatorMessage(
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
    args?: undefined | TranslatorMessageArgs | Accessor<TranslatorMessageArgs>
    children: undefined | string
    tag?: undefined | keyof JSX.IntrinsicElements
}
