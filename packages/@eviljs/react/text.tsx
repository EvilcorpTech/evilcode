import {isString} from '@eviljs/std/type.js'
import {createElement, memo, useMemo} from 'react'
import type {BoxProps} from './box.js'
import {classes} from './classes.js'
import type {I18nMessageValues} from './i18n.js'
import {useI18n} from './i18n.js'

export const Text = memo(function Text(props: TextProps) {
    const {children, className, args, tag, ...otherProps} = props
    const {translate} = useI18n()!

    const message = useMemo(() => {
        if (! isString(children)) {
            return
        }
        return translate(children, args)
    }, [translate, children, args])

    if (! children || ! message) {
        return children
    }

    return (
        createElement(tag ?? 'span', {
            ...otherProps,
            className: classes('Text-cea2', className),
            'data-key': message !== children ? children : undefined,
        }, message)
    )
})
Text.displayName = 'Text'

// Types ///////////////////////////////////////////////////////////////////////

export interface TextProps extends BoxProps {
    args?: undefined | I18nMessageValues
    children?: undefined | string
}
