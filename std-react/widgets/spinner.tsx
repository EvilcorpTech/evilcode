import {classes} from '../react'
import {createElement} from 'react'

import './spinner.css'

export function DotsSpinner(props: SpinnerProps) {
    const {active = true, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('spinner-sa7b7e', props.className, {active})}
        >
            <span className="dot-sdd55d n1-sdd55d"/>
            <span className="dot-sdd55d n2-sdd55d"/>
            <span className="dot-sdd55d n3-sdd55d"/>
        </div>
    )
}

export function PulseSpinner(props: SpinnerProps) {
    const {active = true, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('spinner-5b07bc', props.className, {active})}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SpinnerProps {
    className?: string
    active?: boolean
    [key: string]: unknown
}
