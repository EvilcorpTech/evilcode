import {classes} from '@eviljs/react/classes'
import {displayName} from '@eviljs/react/display-name'
import type {ElementProps, Props, RefElementOf} from '@eviljs/react/props'
import {forwardRef} from 'react'

export const Button = displayName('Button', forwardRef(function Button(
    props: Props<ButtonProps>,
    ref: React.ForwardedRef<RefElementOf<ButtonProps>>,
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

export interface ButtonProps extends ElementProps<'button'> {
}
