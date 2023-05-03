import {Box, type BoxProps} from './box.js'

export function Html(props: HtmlProps) {
    const {children, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            dangerouslySetInnerHTML={{__html: children ?? ''}}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HtmlProps extends BoxProps {
    children?: undefined | string
}
