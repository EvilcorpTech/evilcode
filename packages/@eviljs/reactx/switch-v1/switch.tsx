import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import {asBooleanString} from '@eviljs/web/aria'

export function Switch(props: Props<SwitchProps>): React.JSX.Element {
    const {className, checked, onChange, ...otherProps} = props

    return (
        <button
            {...otherProps}
            className={classes('Switch-5a04 std-button std-button-flex std-switch', className, {
                'std-knob': ! props.children,
            })}
            type="button"
            role="switch"
            aria-checked={asBooleanString(checked ?? false)}
            onClick={event => {
                props?.onClick?.(event)

                if (props.disabled) {
                    return
                }

                onChange?.(! checked)
            }}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SwitchProps extends Omit<ElementProps<'button'>, 'onChange'> {
    checked?: undefined | boolean
    onChange?: undefined | ((value: boolean) => void)
}
