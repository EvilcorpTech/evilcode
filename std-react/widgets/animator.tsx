import React from 'react'
import {classes} from '../react.js'

import './animator.css'

export const DefaultTransitionEffect = 'fade'

export function TransitionAnimator(props: TransitionAnimatorProps) {
    const {children, effect, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('animator-c385f2', props.className, effect ?? DefaultTransitionEffect)}
        >
            {children}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TransitionAnimatorProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
    effect?: TransitionAnimatorEffect
}

export type TransitionAnimatorEffect = 'none' | 'fade' | 'zoom' | 'leak' | 'skid-left'
