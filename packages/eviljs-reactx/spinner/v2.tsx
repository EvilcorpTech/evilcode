import {classes} from '@eviljs/react/react.js'

import './v2.css'

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
    active?: boolean
}
