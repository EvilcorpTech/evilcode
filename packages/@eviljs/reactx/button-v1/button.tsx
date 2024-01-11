import {classes} from '@eviljs/react/classes.js'
import {displayName} from '@eviljs/react/display-name.js'
import {forwardRef} from 'react'

export const Button = displayName('Button', forwardRef(function Button(
    props: ButtonProps,
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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}
