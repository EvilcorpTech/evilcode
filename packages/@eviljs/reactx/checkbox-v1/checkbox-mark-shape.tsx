import {classes} from '@eviljs/react/classes'
import type {CheckboxModel} from './checkbox.js'

export function CheckboxMark(props: CheckboxMarkProps): JSX.Element {
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
}
