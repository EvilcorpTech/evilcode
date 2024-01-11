import {Box, type BoxProps} from '@eviljs/react/box.js'
import {classes} from '@eviljs/react/classes.js'

export function ProgressLine(props: ProgressLineProps) {
    const {active, className, ...otherProps} = props

    return (
        <Box
            tag="div"
            role="progressbar"
            {...otherProps}
            className={classes('ProgressLine-0f03', className)}
            data-active={active}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ProgressLineProps extends BoxProps {
    active: boolean
}
