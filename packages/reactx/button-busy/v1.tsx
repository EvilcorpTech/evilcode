import {classes} from '@eviljs/react/react.js'
import {cloneElement} from 'react'
import {Button, ButtonProps} from '../button/v1.js'

import './v1.css'

export function BusyButton(props: BusyButtonProps) {
    const {className, busy, children, spinner, ...otherProps} = props

    return (
        <Button
            {...otherProps}
            className={classes('BusyButton-f1d2', className, {busy})}
        >
            <div className="content-6f92">
                {children}
            </div>

            {cloneElement(spinner, {
                className: 'spinner-932c std-icon text',
                active: busy,
            })}
        </Button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusyButtonProps extends ButtonProps {
    busy?: boolean
    spinner: React.ReactElement
}
