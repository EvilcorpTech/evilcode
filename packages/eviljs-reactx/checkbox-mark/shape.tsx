import {classes} from '@eviljs/react/react.js'
import {CheckboxModel} from '../checkbox.js'

import './shape.css'

export function CheckboxMark(props: CheckboxMarkProps) {
    const {className, ...otherProps} = props

    return (
        <span
            {...otherProps}
            className={classes('CheckboxMark-67ba', className)}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CheckboxMarkProps extends React.HTMLAttributes<HTMLSpanElement>, CheckboxModel {
    className?: string
}
