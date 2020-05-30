import {className} from '../react'
import {createElement} from 'react'

import './stat.css'

export function Stat(props: StatProps) {
    const {value, unit, label, ...otherProps} = props

    return (
        <span
            {...otherProps}
            {...className('stat-s0fdea', props.className)}
        >
            <div className="valueunit-s5a96f">
                <span className="value-s83eb57">
                    {value}
                </span>
                {unit ? (
                    <span className="unit-d85e42">
                        {unit}
                    </span>
                ) : null}
            </div>
            {label ? (
                <label className="label-c204b3">
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
