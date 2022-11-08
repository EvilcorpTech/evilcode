import './shape.css'

import {classes} from '@eviljs/web/classes.js'
import type {CheckboxModel} from '../checkbox.js'

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
