import {classes} from '@eviljs/react/react.js'
import {Fragment} from 'react'
import {CheckboxModel} from '../checkbox/index.js'

import './sign.css'

export function CheckboxMark(props: CheckboxMarkProps) {
    const {checked, className, ...otherProps} = props

    return (
        <span
            {...otherProps}
            className={classes('CheckboxMark-3ae4 std-flex center align-center', className)}
        >
            <span className="mark-63aa">
                {
                    checked === 'mixed'
                        ? '—'
                    : checked
                        ? '✔︎'
                    : <Fragment>&nbsp;</Fragment>
                }
            </span>
        </span>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CheckboxMarkProps extends React.HTMLAttributes<HTMLSpanElement>, CheckboxModel {
    className?: string
}
