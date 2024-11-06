import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'

export function Spinner(props: Props<SpinnerProps>): JSX.Element {
    const {active, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Spinner-9fef', className)}
            data-active={String(active)}
        >
            <div className="dot-b05e"/>
            <div className="dot-b05e"/>
            <div className="dot-b05e"/>
            <div className="dot-b05e"/>
            <div className="dot-b05e"/>
            <div className="dot-b05e"/>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SpinnerProps extends ElementProps<'div'> {
    active: boolean
}
