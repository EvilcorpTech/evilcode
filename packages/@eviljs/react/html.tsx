import {forwardRef} from 'react'
import {Box, type BoxProps} from './box.js'
import {classes} from './classes.js'

export const Html = forwardRef(function Html<T extends Element = HTMLElement>(
    props: HtmlProps,
    ref: React.ForwardedRef<T>
) {
    const {children, className, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            ref={ref as React.ForwardedRef<HTMLElement>}
            className={classes('Html-b218', className)}
            dangerouslySetInnerHTML={{__html: children ?? ''}}
        />
    )
}) as (
    & (<T extends Element = HTMLElement>(props: HtmlProps<T>) => JSX.Element)
    & Pick<React.FunctionComponent, 'displayName'>
)
Html.displayName = 'Html'

// Types ///////////////////////////////////////////////////////////////////////

export interface HtmlProps<T extends Element = HTMLElement> extends BoxProps<T> {
    children?: undefined | string
}
