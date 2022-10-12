import './sign.css'

import {classes} from '@eviljs/web/classes.js'
import type {CheckboxModel} from '../checkbox.js'

export function CheckboxMark(props: CheckboxMarkProps) {
    const {checked, className, checkedIcon, mixedIcon, ...otherProps} = props

    return (
        <span
            {...otherProps}
            className={classes('CheckboxMark-3ae4 std-flex center align-center', className)}
        >
            {
                checked === 'mixed'
                    ? (mixedIcon ?? '—')
                    : (checkedIcon ?? '✔︎')
            }
        </span>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CheckboxMarkProps extends React.HTMLAttributes<HTMLSpanElement>, CheckboxModel {
    className?: string
    checkedIcon?: React.ReactNode
    mixedIcon?: React.ReactNode
}
