import {classes} from '@eviljs/web/classes.js'

import './meter.css'

export function Meter(props: MeterProps) {
    const {className, value, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Meter-0aa2', className)}
            style={{'--value': value} as React.CSSProperties}
        >
            <div className="markers-c0dd std-cover">
                <div className="layer-33f0 bg"/>
                <div className="layer-33f0 fg"/>
            </div>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MeterProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number
}
