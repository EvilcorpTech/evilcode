import {classes} from '@eviljs/react/classes.js'
import {useCallback, useState} from 'react'

export function ArmoredButton(props: ArmoredButtonProps) {
    const {children, className, ...otherProps} = props
    const [armored, setArmored] = useState(false)

    const armor = useCallback(() => {
        setArmored(true)
    }, [])
    const close = useCallback(() => {
        setArmored(false)
    }, [])

    return (
        <div
            {...otherProps}
            className={classes('ArmoredButton-aa3e std-flex std-flex-align-center', className, {
                initial: ! armored,
                armored,
            })}
        >
            {children({isArmored: armored, armor, close})}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ArmoredButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    children(props: ArmoredChildrenProps): React.ReactNode
}

export interface ArmoredChildrenProps {
    isArmored: boolean
    armor(): void
    close(): void
}
