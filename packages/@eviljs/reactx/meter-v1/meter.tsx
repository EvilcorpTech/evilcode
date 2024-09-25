import {classes} from '@eviljs/react/classes'

export function Meter(props: MeterProps): JSX.Element {
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
