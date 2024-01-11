import {classes} from '@eviljs/react/classes.js'

export function ButtonBusy(props: ButtonBusyProps) {
    const {className, busy, children, spinner, ...otherProps} = props

    return (
        <button
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

export interface ButtonBusyProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    busy?: boolean
    spinner: React.ReactElement
}
