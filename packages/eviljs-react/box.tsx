import React, {createElement} from 'react'

/*
* Renders an element with a dynamic tag.
*
* EXAMPLE
*
* <Box tag={tagName ?? 'p'}>
*     {children}
* </Box>
*/
export function Box(props: BoxProps) {
    const {children, tag = 'div', ...otherProps} = props

    return createElement(tag, otherProps, children)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BoxProps {
    tag?: undefined | string | Tag | React.ComponentType
    children?: undefined | React.ReactNode
    [key: string]: any
}

export type Tag = keyof JSX.IntrinsicElements
