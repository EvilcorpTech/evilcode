import { className } from '../react'
import { createElement } from 'react'

import './dots-spinner.css'

export function DotsSpinner(props: DotsSpinnerProps) {
    const { active = true, ...otherProps } = props

    return (
        <div
            {...otherProps}
            {...className('sa7b7eb6-spinner', props.className, {active})
        }>
            <span className="sdd55de7-dot sdd55de7-n1"/>
            <span className="sdd55de7-dot sdd55de7-n2"/>
            <span className="sdd55de7-dot sdd55de7-n3"/>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DotsSpinnerProps {
    className?: string
    active?: boolean
    [key: string]: unknown
}
