import {classes} from '@eviljs/react/classes'

export function Spinner(props: SpinnerProps): JSX.Element {
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

export interface SpinnerProps extends React.HTMLAttributes<HTMLElement> {
    active: boolean
}
