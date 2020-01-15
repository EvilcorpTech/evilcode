import { className } from '../react'
import { createElement } from 'react'

import './button.css'

export const ButtonType = {
    Special: 'special',
    Primary: 'primary',
    Secondary: 'secondary',
    Tertiary: 'tertiary',
    Flat: 'flat',
    Plain: 'plain',
} as const

export function Button(props: ButtonProps) {
    const { action, type, disabled, children, onClick } = props

    return (
        <button
            {...props}
            {...className('StdButton',
                props.className,
                `std-button std-text-button std-button-${type ?? 'primary'}`,
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
}