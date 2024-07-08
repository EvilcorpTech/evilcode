import {classes} from '@eviljs/react/classes.js'
import {displayName} from '@eviljs/react/display-name.js'
import {forwardRef} from 'react'

export const Button: React.ComponentType<ButtonProps> = displayName('Button', forwardRef(function Button(
    props: Omit<ButtonProps, 'ref'>,
    ref: React.ForwardedRef<HTMLButtonElement>,
) {
    const {className, ...otherProps} = props

    return (
        <button
            {...otherProps}
            ref={ref}
            className={classes('Button-db00 std-button std-text-button', className)}
        />
    )
}))

// Types ///////////////////////////////////////////////////////////////////////

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, React.RefAttributes<HTMLButtonElement> {
}
