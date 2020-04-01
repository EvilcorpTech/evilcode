import { className } from '../react'
import { createElement } from 'react'

import './stat.css'

export function Stat(props: StatProps) {
    const { value, unit, label, ...otherProps } = props

    return (
        <span
            {...otherProps}
            {...className('s0fdeae5-stat', props.className)}
        >
            <div className="s5a96fae-valueunit">
                <span className="s83eb5774-value std-text-h3">
                    {value}
                </span>
                {unit ? (
                    <span className="d85e425b-unit important std-text-subtitle2">
                        {unit}
                    </span>
                ) : null}
            </div>
            {label ? (
                <label className="c204b3fa-label std-text-caption std-text2">
                    {label}
                </label>
            ) : null}
        </span>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StatProps {
    className?: string
    value: string | number
    unit?: string
    label?: string
    [key: string]: unknown
}
