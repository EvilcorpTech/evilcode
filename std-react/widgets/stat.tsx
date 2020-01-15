import { className } from '../react'
import { createElement } from 'react'

import './stat.css'

export function Stat(props: StatProps) {
    const { label, value, unit, ...dynProps } = props

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
            <label className="StdStat-Label std-text-caption std-text2">
                {label}
            </label>
        </span>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StatProps {
    className?: string
    label: string
    value: string | number
    unit?: string
    [key: string]: unknown
}