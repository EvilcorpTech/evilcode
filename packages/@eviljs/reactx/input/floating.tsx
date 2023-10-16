import './floating.css'

import {classes} from '@eviljs/react/classes.js'
import {useMergeRefs} from '@eviljs/react/ref.js'
import {forwardRef, useLayoutEffect, useMemo, useRef, useState} from 'react'

export const Input = forwardRef(function Input(
    props: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>
) {
    const {className, type, label, placeholder, value, autoComplete, autoFocus, tabIndex, onChange, ...otherProps} = props
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
            className={classes('Input-i7ee', className, {
                focus,
                placeholder: labelPlaceholder,
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
                ref={useMergeRefs(inputRef, ref)}
                className="field-ceba std-text-body1"
                type={type || 'text'}
                value={value}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                tabIndex={tabIndex}
                placeholder={placeholder}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onChange={event => onChange?.(event.currentTarget.value)}
            />
        </div>
    )
})
Input.displayName = 'Input'

// Types ///////////////////////////////////////////////////////////////////////

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    type?: undefined | React.HTMLInputTypeAttribute
    label?: undefined | string
    value?: undefined | string
    autoComplete?: undefined | string
    autoFocus?: undefined | boolean
    tabIndex?: undefined | number
    onChange?: undefined | ((event: string) => void)
}
