import {isDefined} from '@eviljs/std/type.js'
import {createElement, forwardRef} from 'react'

/*
* Renders an element with a dynamic tag.
*
* EXAMPLE
*
* <Box tag={tagName ?? 'p'}>
*     {children}
* </Box>
*/
export const Box = forwardRef(function Box<T>(
    props: BoxProps<T>,
    ref?: undefined | React.Ref<T>,
) {
    const {tag, ...otherProps} = props

    return createElement(tag ?? 'div', {...otherProps as {}, ref})
}) as (<T>(props: BoxProps<T>) => JSX.Element) & Pick<React.FunctionComponent, 'displayName'>
Box.displayName = 'Box'

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
export const BoxOptional = forwardRef(function BoxOptional<T>(
    props: BoxOptionalProps<T>,
    ref?: undefined | React.Ref<T>,
) {
    const {if: guard, ...otherProps} = props

    if (isDefined(guard) && ! guard) {
        return null
    }

    return Box({...otherProps, ref})
}) as (<T>(props: BoxOptionalProps<T>) => JSX.Element) & Pick<React.FunctionComponent, 'displayName'>
BoxOptional.displayName = 'BoxOptional'

// Types ///////////////////////////////////////////////////////////////////////

export interface BoxProps<T = Element> extends React.AllHTMLAttributes<T>, React.RefAttributes<T> {
    tag?: undefined | string | Tag
}

export interface BoxOptionalProps<T = Element> extends BoxProps<T> {
    if?: undefined | any
}

export type Tag = keyof JSX.IntrinsicElements
