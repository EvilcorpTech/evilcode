import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import {asBooleanString} from '@eviljs/web/aria'

export function Switch(props: Props<SwitchProps>): React.JSX.Element {
    const {className, checked, children, onChange, ...otherProps} = props

    return (
        <button
            type="button"
            {...otherProps}
            className={classes('Switch-5a04 std-switch', className, {
                'std-knob': ! children,
            })}
            role="switch"
            aria-checked={asBooleanString(checked ?? false)}
            onClick={event => {
                props?.onClick?.(event)

                if (props.disabled) {
                    return
                }

                onChange?.(! checked)
            }}
        >
            {children}
        </button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SwitchProps extends Omit<ElementProps<'button'>, 'onChange'> {
    checked?: undefined | boolean
    onChange?: undefined | ((value: boolean) => void)
}
