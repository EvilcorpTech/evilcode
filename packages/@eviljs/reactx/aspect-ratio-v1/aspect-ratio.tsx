import {Box, type BoxProps} from '@eviljs/react/box'
import {classes} from '@eviljs/react/classes'

export function AspectRatio(props: AspectRatioProps): JSX.Element {
    const {className, width, height, style, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            className={classes('AspectRatio-a4fe', className)}
            style={{
                '--AspectRatio': height / width,
                ...style,
            } as React.CSSProperties}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AspectRatioProps extends BoxProps {
    width: number
    height: number
}
