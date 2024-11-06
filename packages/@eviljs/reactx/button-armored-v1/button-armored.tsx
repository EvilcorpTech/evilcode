import {classes} from '@eviljs/react/classes'
import type {ElementProps} from '@eviljs/react/props'
import {useCallback, useState} from 'react'

export function ButtonArmored(props: ButtonArmoredProps): JSX.Element {
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
            className={classes('ButtonArmored-aa3e std-flex std-flex-align-center', className, {
                initial: ! armored,
                armored,
            })}
        >
            {children({isArmored: armored, armor, close})}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ButtonArmoredProps extends Omit<ElementProps<'div'>, 'children'> {
    children(props: ButtonArmoredChildrenProps): React.ReactNode
}

export interface ButtonArmoredChildrenProps {
    isArmored: boolean
    armor(): void
    close(): void
}
