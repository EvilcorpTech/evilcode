import {asArray, isString} from '@eviljs/std-lib/type.js'
import React from 'react'
import {useI18n} from '../i18n.js'
import {classes} from '../react.js'
const {createElement, Fragment, Children} = React

export function Text(props: TextProps) {
    const {children, tag = 'p', ...otherProps} = props
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
                    className: classes('text-cea2a3', props.className),
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
