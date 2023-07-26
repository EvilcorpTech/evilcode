import {classes} from '@eviljs/react/classes.js'
import {Button, type ButtonProps} from './button.js'

export function BusyButton(props: BusyButtonProps) {
    const {className, busy, children, spinner, ...otherProps} = props

    return (
        <Button
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
        </Button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusyButtonProps extends ButtonProps {
    busy?: boolean
    spinner: React.ReactElement
}
