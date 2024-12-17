import {createElement} from 'react'
import type {Props} from './props.js'

/*
* Renders an element with a dynamic tag.
*
* EXAMPLE
*
* <Box tag={tagName ?? 'p'}>
*     {children}
* </Box>
*/
export function Box<T extends Element = HTMLElement>(props: Props<BoxProps<T>>): React.JSX.Element {
    const {tag, ...otherProps} = props

    return createElement(tag ?? 'div', otherProps)
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
export function BoxOptional<T extends Element = HTMLElement>(props: Props<BoxOptionalProps<T>>): undefined | React.JSX.Element {
    const {if: guard, ...otherProps} = props

    if (! guard) {
        return
    }

    return <Box {...otherProps}/>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BoxProps<T extends Element = HTMLElement> extends React.AllHTMLAttributes<T>, React.RefAttributes<T> {
    tag?: undefined | string | Tag
}

export interface BoxOptionalProps<T extends Element = HTMLElement> extends BoxProps<T> {
    if?: undefined | any
}

export type Tag = keyof React.JSX.IntrinsicElements
