import {classes} from '@eviljs/react/classes.js'

export function Spinner(props: SpinnerProps): JSX.Element {
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

export interface SpinnerProps extends React.HTMLAttributes<HTMLElement> {
    active: boolean
}
