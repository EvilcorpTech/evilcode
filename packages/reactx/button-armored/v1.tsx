import {classes} from '@eviljs/react/react.js'
import {useState} from 'react'
import {Button} from '../button/v1.js'

import './v1.css'

export function ArmoredButton(props: ArmoredButtonProps) {
    const {armorClass, cancel, cancelClass, children, className, confirm, confirmClass, onClick, ...otherProps} = props
    const [armored, setArmored] = useState(false)

    return (
        <div
            {...otherProps}
            className={classes('ArmoredButton-aa3e std-flex align-center', className, {armored})}
        >
            <Button
                className={classes('armor-eb3d', armorClass)}
                onClick={() => setArmored(true)}
            >
                {children ?? 'Armor'}
            </Button>

            <Button
                className={classes('cancel-da15', cancelClass)}
                onClick={() => setArmored(false)}
            >
                {cancel ?? 'Cancel'}
            </Button>

            <Button
                className={classes('confirm-eccb', confirmClass)}
                onClick={(event) => {
                    setArmored(false)
                    onClick?.(event)
                }}
            >
                {confirm ?? 'Confirm'}
            </Button>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ArmoredButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
    armorClass?: string
    cancel?: React.ReactNode
    cancelClass?: string
    confirm?: React.ReactNode
    confirmClass?: string
    onClick?(event: React.MouseEvent<HTMLButtonElement>): void
}
