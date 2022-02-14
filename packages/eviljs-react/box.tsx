import {isDefined} from '@eviljs/std/type.js'
import {createElement} from 'react'

/*
* Renders an element with a dynamic tag.
*
* EXAMPLE
*
* <Box tag={tagName ?? 'p'}>
*     {children}
* </Box>
*/
export function Box<P extends BoxProps<T>, T>(props: P) {
    const {tag = 'div', ...otherProps} = props

    return createElement(tag, otherProps as {})
}

/*
* Optionally renders an element with a dynamic tag.
*
* EXAMPLE
*
* <Box if={children} tag={tagName ?? 'p'}>
*     {children}
* </Box>
*
* Same of
*
* {children &&
*     <OptionalBox tag={tagName ?? 'p'}>
*         {children}
*     </OptionalBox>
* }
*/
export function OptionalBox<P extends OptionalBoxProps<T>, T>(props: P) {
    const {if: guard, ...otherProps} = props

    if (isDefined(guard) && ! guard) {
        return null
    }

    return Box(otherProps)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BoxProps<T = Element> extends React.AllHTMLAttributes<T> {
    tag?: undefined | string | Tag | React.ComponentType
}

export interface OptionalBoxProps<T = Element> extends BoxProps<T> {
    if?: any
}

export type Tag = keyof JSX.IntrinsicElements
