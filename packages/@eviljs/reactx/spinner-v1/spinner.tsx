import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'

export function Spinner(props: Props<SpinnerProps>): React.JSX.Element {
    const {active, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Spinner-sa7b', className)}
            data-active={String(active)}
        >
            <span className="dot-sdd5 n1-sdd5"/>
            <span className="dot-sdd5 n2-sdd5"/>
            <span className="dot-sdd5 n3-sdd5"/>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SpinnerProps extends ElementProps<'div'> {
    active: boolean
}
