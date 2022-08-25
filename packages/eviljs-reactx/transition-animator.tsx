import {Box, BoxProps} from '@eviljs/react/box.js'
import {classes} from '@eviljs/react/classes.js'

export enum TransitionEffect {
    Fade = 'std-transition-fade',
    Leak = 'std-transition-leak',
    None = 'std-transition-none',
    SkidLeft = 'std-transition-skid-left',
    Zoom = 'std-transition-zoom',
}

export function TransitionAnimator(props: TransitionAnimatorProps) {
    const {children, className, effect, ...otherProps} = props

    return (
        <Box
            {...otherProps}
            className={classes('TransitionAnimator-c385', className, effect)}
        >
            {children}
        </Box>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TransitionAnimatorProps extends BoxProps {
    effect: TransitionEffect
}
