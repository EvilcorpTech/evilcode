import {Box, type BoxProps} from '@eviljs/react/box.js'
import type {VoidProps} from '@eviljs/react/type.js'
import {classes} from '@eviljs/web/classes.js'

export function PlaceholderBlock(props: PlaceholderBlockProps): JSX.Element {
    const {className, height, style, width, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            className={classes('PlaceholderBlock-e79a', className)}
            style={{
                ...style,
                width,
                ...{'--PlaceholderBlock-height': height} as React.CSSProperties,
            }}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PlaceholderBlockProps extends VoidProps<BoxProps> {
    height?: undefined | string
    width?: undefined | string
}
