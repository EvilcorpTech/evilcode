import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'

export function ButtonBusy(props: Props<ButtonBusyProps>): React.JSX.Element {
    const {className, busy, children, spinner, ...otherProps} = props

    return (
        <button
            type="button"
            {...otherProps}
            className={classes('BusyButton-f1d2', className)}
            data-busy={String(busy)}
        >
            <span className="content-6f92">
                {children}
            </span>

            <span className="spinner-932c">
                {spinner}
            </span>
        </button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ButtonBusyProps extends ElementProps<'button'> {
    busy?: boolean
    spinner: React.ReactElement
}
