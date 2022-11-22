import {isString} from '@eviljs/std/type.js'
import {createElement, memo, useMemo} from 'react'
import type {BoxProps} from './box.js'
import {classes} from './classes.js'
import {useI18n} from './i18n.js'

export const Text = memo(function Text(props: TextProps) {
    const {children, className, tag, ...otherProps} = props
    const {translate} = useI18n()!

    const message = useMemo(() => {
        if (! isString(children)) {
            return
        }
        return translate(children)
    }, [children])

    if (! children || ! message) {
        return <>{children}</>
    }

    return (
        createElement(tag ?? 'span', {
            ...otherProps,
            className: classes('Text-cea2', className),
            'data-key': message !== children ? children : undefined,
        }, message)
    )
})

// Types ///////////////////////////////////////////////////////////////////////

export interface TextProps extends BoxProps {
    children?: undefined | string
}