import { className } from '../react'
import { createElement } from 'react'

import './dots-spinner.css'

export function DotsSpinner(props: DotsSpinnerProps) {
    const { active = true } = props

    return (
        <div {...className('StdDotsSpinner', props.className, {active})}>
            <span className="StdDotsSpinner-Dot StdDotsSpinner-Dot1"/>
            <span className="StdDotsSpinner-Dot StdDotsSpinner-Dot2"/>
            <span className="StdDotsSpinner-Dot StdDotsSpinner-Dot3"/>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DotsSpinnerProps {
    className?: string
    active?: boolean
}
