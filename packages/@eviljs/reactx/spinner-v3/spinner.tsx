import {classes} from '@eviljs/react/classes'

export function Spinner(props: SpinnerProps): JSX.Element {
    const {active, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Spinner-2a9d', className)}
            data-active={String(active)}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SpinnerProps extends React.HTMLAttributes<HTMLElement> {
    active: boolean
}
