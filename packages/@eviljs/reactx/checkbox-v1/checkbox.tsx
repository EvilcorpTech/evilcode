import {classes} from '@eviljs/react/classes'
import {asBooleanString} from '@eviljs/web/aria'
import {cloneElement, isValidElement} from 'react'

export function Checkbox(props: CheckboxProps): JSX.Element {
    const {className, children, checked, disabled, onChange, ...otherProps} = props
    const enabled = ! disabled

    return (
        <button
            tabIndex={0}
            {...otherProps}
            className={classes('Checkbox-16ba std-button std-button-flex', className)}
            role="checkbox"
            aria-checked={
                checked === 'mixed'
                    ? 'mixed'
                : asBooleanString(checked ?? false)
            }
            disabled={disabled}
            onClick={enabled
                ? event => onChange?.(checked === 'mixed' ? true : ! checked)
                : undefined
            }
        >
            {isValidElement<any>(children) &&
                cloneElement(children, {checked})
            }
        </button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CheckboxProps extends CheckboxModel, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    onChange?: undefined | ((value: boolean) => void)
}

export interface CheckboxModel {
    checked?: undefined | null | boolean | 'mixed'
}
