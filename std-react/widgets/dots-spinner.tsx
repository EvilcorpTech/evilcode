import {className} from '../react'
import {createElement} from 'react'

import './dots-spinner.css'

export function DotsSpinner(props: DotsSpinnerProps) {
    const {active = true, ...otherProps} = props

    return (
        <div
            {...otherProps}
            {...className('spinner-sa7b7e', props.className, {active})
        }>
            <span className="dot-sdd55d n1-sdd55d"/>
            <span className="dot-sdd55d n2-sdd55d"/>
            <span className="dot-sdd55d n3-sdd55d"/>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DotsSpinnerProps {
    className?: string
    active?: boolean
    [key: string]: unknown
}
