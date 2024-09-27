import {createElement, memo} from 'react'
import type {BoxProps} from './box.js'
import {classes} from './classes.js'
import {useTranslatorMessage, type TranslatorMessageArgs, type TranslatorMessageKey} from './translator.js'
import type {VoidProps} from './type.js'

export const Message: React.ComponentType<MessageProps> = memo(function Message(props: MessageProps) {
    const {children, className, args, tag, ...otherProps} = props
    const message = useTranslatorMessage(children, args)

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
    const message = useTranslatorMessage(children, args)

    return message
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MessageProps extends VoidProps<BoxProps>, TranslateProps {
}

export interface TranslateProps {
    args?: undefined | TranslatorMessageArgs
    children: TranslatorMessageKey
}
