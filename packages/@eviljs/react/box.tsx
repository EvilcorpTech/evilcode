import {createElement, forwardRef} from 'react'
import {displayName} from './display-name.js'

/*
* Renders an element with a dynamic tag.
*
* EXAMPLE
*
* <Box tag={tagName ?? 'p'}>
*     {children}
* </Box>
*/
export const Box = displayName('Box', forwardRef(function Box<T extends Element = HTMLElement>(
    props: BoxProps<T>,
    ref: React.ForwardedRef<T>
) {
    const {tag, ...otherProps} = props

    return createElement(tag ?? 'div', {...otherProps as {}, ref})
})) as (
    & (<T extends Element = HTMLElement>(props: BoxProps<T>) => JSX.Element)
    & Pick<React.FunctionComponent, 'displayName'>
)

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
export const BoxOptional = displayName('BoxOptional', forwardRef(function BoxOptional<T extends Element = HTMLElement>(
    props: BoxOptionalProps<T>,
    ref: React.ForwardedRef<T>
) {
    const {if: guard, ...otherProps} = props

    if (! guard) {
        return
    }

    return <Box {...otherProps} ref={ref}/>
})) as (
    & (<T extends Element = HTMLElement>(props: BoxOptionalProps<T>) => JSX.Element)
    & Pick<React.FunctionComponent, 'displayName'>
)

// Types ///////////////////////////////////////////////////////////////////////

export interface BoxProps<T extends Element = HTMLElement> extends React.AllHTMLAttributes<T>, React.RefAttributes<T> {
    tag?: undefined | string | Tag
}

export interface BoxOptionalProps<T extends Element = HTMLElement> extends BoxProps<T> {
    if?: undefined | any
}

export type Tag = keyof JSX.IntrinsicElements
