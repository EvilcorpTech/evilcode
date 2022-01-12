import {classes} from '@eviljs/react/react.js'
import {CheckboxModel} from '../checkbox.js'

import './sign.css'

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
