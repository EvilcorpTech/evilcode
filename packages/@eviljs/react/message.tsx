import {createElement, memo} from 'react'
import type {BoxProps} from './box.js'
import {classes} from './classes.js'
import {useI18nMessage, type I18nMessageArgs, type I18nMessageKey} from './i18n.js'
import type {VoidProps} from './type.js'

export const Message = memo(function Message(props: MessageProps) {
    const {children, className, args, tag, ...otherProps} = props
    const message = useI18nMessage(children, args)

    return (
        createElement(tag ?? 'span', {
            ...otherProps,
            className: classes('Message-cea2', className),
            'data-key': message !== children ? children : undefined,
        }, message)
    )
})

export function Translate(props: TranslateProps) {
    const {children, args} = props
    const message = useI18nMessage(children, args)

    return message
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MessageProps extends VoidProps<BoxProps>, TranslateProps {
}

export interface TranslateProps {
    args?: undefined | I18nMessageArgs
    children: I18nMessageKey
}
