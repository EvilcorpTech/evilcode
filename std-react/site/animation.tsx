import {classes} from '../react.js'
import React from 'react'

import './animation.css'

export const DefaultTransition = 'fade'

export function Animator(props: AnimatorProps) {
    const {children, transition, ...otherProps} = props

    return (
        <div className={classes('animator-c385f2 std-layer std-cover', props.className, transition ?? DefaultTransition)}>
            {children}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AnimatorProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
    transition?: AnimatorTransition
}

export type AnimatorTransition = 'fade' | 'zoom'
