import {isString} from '@eviljs/std/type-is.js'
import {splitProps} from 'solid-js'
import {classes} from './classes.js'
import {Html} from './html.jsx'
import {createI18nMessage} from './i18n.js'
import type {MessageProps} from './message.jsx'

export function MessageHtml(props: MessageHtmlProps) {
    const [_, otherProps] = splitProps(props, ['args', 'children'])

    const message = createI18nMessage(
        () => isString(props.children)
            ? props.children
            : undefined
        ,
        props.args,
    )

    return (
        <Html
            {...otherProps}
            class={classes('TextHtml-a9b5', props.class)}
            data-key={message() !== props.children
                ? props.children
                : undefined
            }
        >
            {message()}
        </Html>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MessageHtmlProps extends MessageProps {
}
