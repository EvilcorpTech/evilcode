import {classes} from './react.js'

import './animator.css'

export const DefaultTransitionEffect = 'fade'

export function TransitionAnimator(props: TransitionAnimatorProps) {
    const {children, className, effect, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('TransitionAnimator-c385', className, effect ?? DefaultTransitionEffect)}
        >
            {children}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TransitionAnimatorProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: undefined | React.ReactNode
    effect?: undefined | TransitionAnimatorEffect
}

export type TransitionAnimatorEffect = 'none' | 'fade' | 'zoom' | 'leak' | 'skid-left'
