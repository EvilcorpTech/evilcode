import {classes} from '../react'
import {createElement} from 'react'

export const ButtonType = {
    Special: 'special',
    Primary: 'primary',
    Secondary: 'secondary',
    Tertiary: 'tertiary',
    Flat: 'flat',
    Plain: 'plain',
} as const

export function Button(props: ButtonProps) {
    const {action, type, disabled, children, onClick, ...otherProps} = props

    return (
        <button
            {...otherProps}
            className={classes('button-bfce14 std-button std-text-button', props.className,
                `std-button-${type ?? 'primary'}`,
            )}
            type={action ?? 'button'}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ButtonProps {
    className?: string
    action?: 'button' | 'submit' | 'reset'
    type?: (typeof ButtonType)[keyof typeof ButtonType]
    disabled?: boolean
    children?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    [key: string]: unknown
}
