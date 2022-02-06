import {asArray, isString} from '@eviljs/std/type.js'
import {useI18n} from '@eviljs/react/i18n.js'
import {classes} from '@eviljs/web/classes.js'
import {createElement, Fragment, Children} from 'react'

export function Text(props: TextProps) {
    const {children, className, tag = 'p', ...otherProps} = props
    const {translate} = useI18n()

    if (! children || Children.count(children) === 0) {
        return null
    }

    return (
        <Fragment>
            {asArray(children).map((it, idx) =>
                createElement(tag, {
                    ...otherProps,
                    key: idx,
                    className: classes('text-cea2a3', className),
                    children: isString(it)
                        ? translate(it)
                        : it
                    ,
                })
            )}
        </Fragment>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children?: React.ReactNode
    tag?: keyof JSX.IntrinsicElements
}
