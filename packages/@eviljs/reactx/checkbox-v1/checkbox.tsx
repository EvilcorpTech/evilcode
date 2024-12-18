import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import {asBooleanString} from '@eviljs/web/aria'
import {cloneElement, isValidElement} from 'react'

export function Checkbox(props: Props<CheckboxProps>): React.JSX.Element {
    const {className, children, checked: checkedOptional, disabled: disabledOptional, onChange, ...otherProps} = props
    const checked = checkedOptional ?? false
    const disabled = disabledOptional ?? false

    return (
        <button
            type="button"
            tabIndex={0}
            {...otherProps}
            className={classes('Checkbox-16ba', className)}
            role="checkbox"
            aria-checked={
                checked === 'mixed'
                    ? 'mixed'
                    : asBooleanString(checked)
            }
            disabled={disabled}
            onClick={event => {
                props?.onClick?.(event)

                if (disabled) {
                    return
                }

                onChange?.(checked === 'mixed' ? true : ! checked)
            }}
        >
            {isValidElement<CheckboxModel>(children) &&
                cloneElement(children, {checked})
            }
        </button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CheckboxProps extends Omit<ElementProps<'button'>, 'children' | 'onChange'>, CheckboxModel {
    children?: undefined | React.ReactElement<CheckboxModel>
    onChange?: undefined | ((value: boolean) => void)
}

export interface CheckboxModel {
    checked?: undefined | null | boolean | 'mixed'
}
