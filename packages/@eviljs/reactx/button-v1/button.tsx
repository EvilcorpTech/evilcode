import {classes} from '@eviljs/react/classes'
import {displayName} from '@eviljs/react/display-name'
import {forwardRef} from 'react'

export const Button = displayName('Button', forwardRef(function Button(
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
})) as React.FunctionComponent<ButtonProps>

// Types ///////////////////////////////////////////////////////////////////////

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, React.RefAttributes<HTMLButtonElement> {
}
