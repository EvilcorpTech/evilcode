import {classes} from '@eviljs/react/react.js'
import {Fragment} from 'react'
import {CheckboxModel} from '../checkbox/v1.js'

import './v2.css'

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
