import {classes} from '@eviljs/react/classes.js'
import {asBooleanString} from '@eviljs/web/aria.js'

export function Switch(props: SwitchProps): JSX.Element {
    const {className, checked, onChange, ...otherProps} = props

    return (
        <button
            {...otherProps}
            className={classes('Switch-5a04 std-button std-button-flex std-switch', className, {
                'std-knob': ! otherProps.children,
            })}
            type="button"
            role="switch"
            aria-checked={asBooleanString(checked ?? false)}
            onClick={! otherProps.disabled
                ? () => onChange?.(! checked)
                : undefined
            }
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: undefined | boolean
    onChange?: undefined | ((value: boolean) => void)
}
