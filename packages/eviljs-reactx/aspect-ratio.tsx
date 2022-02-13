import {Box, BoxProps} from '@eviljs/react/box.js'
import {classes} from '@eviljs/react/classes.js'
import {CSSProperties} from 'react'

import './aspect-ratio.css'

export function AspectRatio(props: AspectRatioProps) {
    const {children, className, width, height, style, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            className={classes('AspectRatio-a4fe', className)}
            style={{
                '--AspectRatio': height / width,
                ...style,
            } as CSSProperties}
        >
            {children}
        </Box>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AspectRatioProps extends BoxProps {
    width: number
    height: number
}