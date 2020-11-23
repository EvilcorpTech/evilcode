import {classes} from '../react.js'

import './checkbox.css'

export function Checkbox(props: CheckboxProps) {
    const {children, checked, onChange, ...otherProps} = props

    return (
        <button
            tabIndex={0}
            {...otherProps}
            className={classes('checkbox-16ba98', props.className, {checked})}
            role="checkbox"
            aria-checked={checked ? checked : undefined}
            onClick={(event) => onChange?.(! checked)}
        >
            {/*
            * We use a child element for styling, so that the wrapping button
            * can define a padding to increase the minimum touchable area,
            * which should be around 44px.
            */}
            {children || <span className="controls-67ba84"/>}
        </button>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked: boolean
    onChange?(value: boolean): void
}
