import type {BoxProps} from '@eviljs/react/box.js'
import {classes} from '@eviljs/react/classes.js'
import {useI18n} from '@eviljs/react/i18n.js'
import {isString} from '@eviljs/std/type.js'
import {Children, createElement, Fragment} from 'react'

export function Text(props: TextProps) {
    const {children, className, tag, ...otherProps} = props
    const {translate} = useI18n()!

    const classList = classes('text-cea2a3', className)

    function render(
        child: TextProps['children'],
        key: undefined | number | string,
    ) {
        const content = isString(child)
            ? translate(child)
            : child

        return createElement(
            tag ?? 'p',
            {
                ...otherProps,
                key,
                className: classList,
                'data-msg': content !== child
                    ? child
                    : undefined
                ,
            },
            content,
        )
    }

    const childrenCount = Children.count(children)

    if (! children || childrenCount === 0) {
        return null
    }

    if (childrenCount === 1) {
        // Optimization.
        return render(children, undefined)
    }

    return (
        <Fragment>
            {Children.map(children, render)}
        </Fragment>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TextProps extends BoxProps {
    children?: undefined | string | Array<string> | React.ReactNode
}
