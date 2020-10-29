import {classes} from '../react.js'
import React from 'react'

import './animator.css'

export const DefaultTransition = 'fade'

export function TransitionAnimator(props: TransitionAnimatorProps) {
    const {children, transition, ...otherProps} = props

    return (
        <div className={classes('animator-c385f2', props.className, transition ?? DefaultTransition)}>
            {children}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TransitionAnimatorProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
    transition?: TransitionAnimatorTransition
}

export type TransitionAnimatorTransition = 'fade' | 'zoom'
