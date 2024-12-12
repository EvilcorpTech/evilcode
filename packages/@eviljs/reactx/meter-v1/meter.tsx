import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'

export function Meter(props: Props<MeterProps>): React.JSX.Element {
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

export interface MeterProps extends ElementProps<'div'> {
    value: number
}
