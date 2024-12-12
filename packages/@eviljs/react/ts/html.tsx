import {Box, type BoxProps} from './box.js'
import {classes} from './classes.js'
import type {Props} from './props.js'

export function Html(props: Props<HtmlProps>): React.JSX.Element {
    const {children, className, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            className={classes('Html-b218', className)}
            dangerouslySetInnerHTML={{__html: children ?? ''}}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HtmlProps<T extends Element = HTMLElement> extends BoxProps<T> {
    children?: undefined | string
}
