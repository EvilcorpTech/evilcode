import {classes} from '@eviljs/std-react/react.js'
import React from 'react'
const {useState, useRef, useLayoutEffect, useMemo} = React

import './v1.css'

export const InputType = {
    Text: 'text',
    Password: 'password',
} as const

export function Input(props: InputProps) {
    const {type, label, placeholder, value, autoComplete, autoFocus, tabIndex, onChange, ...otherProps} = props
    const [focus, setFocus] = useState(false)
    const [translateY, setTranslateY] = useState(0)
    const fieldRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLLabelElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const labelPlaceholder = ! Boolean(value) && ! focus

    const labelScale = 1.4
    const labelStyle = useMemo(() => {
        return {
            transform: `translateY(${translateY}px) scale(${labelScale})`,
        }
    }, [translateY])

    useLayoutEffect(() => {
        const field = fieldRef.current
        const label = labelRef.current
        const fieldHeight = field?.getBoundingClientRect().height ?? 0
        const fieldTop = field?.getBoundingClientRect().top ?? 0
        const labelTop = label?.getBoundingClientRect().top ?? 0
        const labelHeight = label?.clientHeight ?? 0
        const offset = labelTop - fieldTop
        const translateY = fieldHeight - offset * 2 - labelHeight * labelScale

        setTranslateY(translateY)
    }, [fieldRef.current, labelRef.current])

    return (
        <div
            {...otherProps}
            ref={fieldRef}
            className={classes('Input-i7ee', props.className, {
                focus, placeholder: labelPlaceholder,
            })}
            onClick={() =>
                inputRef.current?.focus()
            }
        >
            {label &&
                <label
                    ref={labelRef}
                    className="label-id45 std-text-body2"
                    style={labelPlaceholder ? labelStyle : undefined}
                >
                    {label}
                </label>
            }

            <input
                ref={inputRef}
                className="field-ceba std-text-subtitle2"
                type={type || InputType.Text}
                value={value}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                tabIndex={tabIndex}
                placeholder={placeholder}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onChange={event => onChange?.(event.target.value)}
            />
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    type?: (typeof InputType)[keyof typeof InputType]
    label?: string
    value?: string
    autoComplete?: string
    autoFocus?: boolean
    tabIndex?: number
    onChange?: (event: string) => void
}
