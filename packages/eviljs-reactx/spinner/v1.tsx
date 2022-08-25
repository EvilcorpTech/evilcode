import {classes} from '@eviljs/web/classes.js'

import './v1.css'

export function Spinner(props: SpinnerProps) {
    const {active, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Spinner-sa7b', className, {active})}
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
