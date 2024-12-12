import {Box, type BoxProps} from '@eviljs/react/box'
import {classes} from '@eviljs/react/classes'

export function ProgressLine(props: ProgressLineProps): React.JSX.Element {
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
