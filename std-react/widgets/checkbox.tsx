import {classes} from '../react.js'

import './checkbox.css'

export function Checkbox(props: CheckboxProps) {
    const {children, checked, disabled, onChange, ...otherProps} = props
    const enabled = ! disabled

    return (
        <button
            tabIndex={0}
            {...otherProps}
            className={classes('checkbox-16ba98', props.className)}
            role="checkbox"
            aria-checked={
                checked === 'mixed'
                    ? 'mixed'
                : checked
                    ? 'true'
                : 'false'
            }
            disabled={disabled}
            onClick={enabled
                ? (event) => onChange?.(checked === 'mixed' ? true : ! checked)
                : undefined
            }
        >
            {/*
            * We use a child element for styling, so that the wrapping button
            * can define a padding to increase the minimum touchable area.
            */}
            {children}
        </button>
    )
}

export function SquareCheckmark(props: SquareCheckmarkProps) {
    return (
        <span className={classes('square-67ba84', props.className)}/>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: null | boolean | 'mixed'
    onChange?(value: boolean): void
}

export interface SquareCheckmarkProps {
    className?: string
}
