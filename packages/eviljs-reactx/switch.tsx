import {classes} from '@eviljs/react/react.js'

export function Switch(props: SwitchProps) {
    const {className, checked, disabled, onChange, ...otherProps} = props
    const enabled = ! disabled

    return (
        <button
            tabIndex={0}
            {...otherProps}
            className={classes('Switch-5a04 std-switch', className)}
            type="button"
            role="switch"
            aria-checked={checked ? 'true' : 'false'}
            disabled={disabled}
            onClick={enabled
                ? () => onChange?.(! checked)
                : undefined
            }
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean
    onChange?(value: boolean): void
}
