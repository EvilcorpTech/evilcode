import {classes} from '@eviljs/std-react/react.js'

import './v4.css'

export function Spinner(props: SpinnerProps) {
    const {active, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Spinner-9fef', className, {active})}
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
    active?: boolean
}
