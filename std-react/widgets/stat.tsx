import { className } from '../react'
import { createElement } from 'react'

import './stat.css'

export function Stat(props: StatProps) {
    const { value, unit, label, ...dynProps } = props

    return (
        <span
            {...dynProps}
            {...className('StdStat', props.className)}
        >
            <div className="StdStat-ValueAndUnit">
                <span className="StdStat-Value std-text-h3">
                    {value}
                </span>
                {unit ? (
                    <span className="StdStat-Unit std-text-subtitle2">
                        {unit}
                    </span>
                ) : null}
            </div>
            {label ? (
                <label className="StdStat-Label std-text-caption std-text2">
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
