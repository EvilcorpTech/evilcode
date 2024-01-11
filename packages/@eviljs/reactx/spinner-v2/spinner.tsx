import {classes} from '@eviljs/react/classes.js'

export function Spinner(props: SpinnerProps) {
    const {active, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Spinner-5b07', className)}
            data-active={String(active)}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SpinnerProps extends React.HTMLAttributes<HTMLElement> {
    active: boolean
}
