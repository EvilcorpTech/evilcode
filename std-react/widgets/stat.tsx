import { className } from '../react'
import { createElement } from 'react'

import './stat.css'

export function Stat(props: StatProps) {
    const { value, unit, label, ...otherProps } = props

    return (
        <span
            {...otherProps}
            {...className('stat-s0fdea', props.className)}
        >
            <div className="valueunit-s5a96f">
                <span className="s83eb5774-value std-text-h3">
                    {value}
                </span>
                {unit ? (
                    <span className="unit-d85e42 important std-text-subtitle2">
                        {unit}
                    </span>
                ) : null}
            </div>
            {label ? (
                <label className="label-c204b3 std-text-caption std-text2">
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
