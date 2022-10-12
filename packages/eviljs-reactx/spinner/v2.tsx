import './v2.css'

import {classes} from '@eviljs/web/classes.js'

export function Spinner(props: SpinnerProps) {
    const {active, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Spinner-5b07', className, {active})}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SpinnerProps extends React.HTMLAttributes<HTMLElement> {
    active: boolean
}
