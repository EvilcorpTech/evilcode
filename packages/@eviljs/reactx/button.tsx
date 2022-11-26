import {classes} from '@eviljs/web/classes.js'

export function Button(props: ButtonProps) {
    const {className, children, ...otherProps} = props

    return (
        <button
            {...otherProps}
            className={classes('Button-db00 std-button std-text-button', className)}
        >
            {children}
        </button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: undefined | React.ReactNode
}
