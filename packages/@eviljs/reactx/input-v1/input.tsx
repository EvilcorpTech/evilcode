import {classes} from '@eviljs/react/classes'
import {displayName} from '@eviljs/react/display-name'
import type {ElementProps, Props, RefElementOf} from '@eviljs/react/props'
import {useMergeRefs} from '@eviljs/react/ref'
import {forwardRef, useLayoutEffect, useRef, useState} from 'react'

export const Input = displayName('Input', forwardRef(function Input(
    props: Props<InputProps>,
    ref: React.ForwardedRef<RefElementOf<InputProps>>,
) {
    const {className, type, label, placeholder, value, autoComplete, autoFocus, tabIndex, onChange, ...otherProps} = props
    const [focus, setFocus] = useState(false)
    const [translateY, setTranslateY] = useState(0)
    const fieldRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLLabelElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const inputRefMerged = useMergeRefs(inputRef, ref)

    const labelPlaceholder = ! Boolean(value) && ! focus

    const labelScale = 1.4

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
    }, [Boolean(label)])

    return (
        <div
            {...otherProps}
            ref={fieldRef}
            className={classes('Input-i7ee', className)}
            data-focus={focus}
            data-placeholder={labelPlaceholder}
            onClick={() =>
                inputRef.current?.focus()
            }
        >
            {label &&
                <label
                    ref={labelRef}
                    className="label-id45 std-text-body2"
                    style={{
                        transform: labelPlaceholder
                            ? `translateY(${translateY}px) scale(${labelScale})`
                            : undefined
                        ,
                    }}
                >
                    {label}
                </label>
            }

            <input
                ref={inputRefMerged}
                className="field-ceba std-text-body1"
                type={type || 'text'}
                value={value}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                tabIndex={tabIndex}
                placeholder={placeholder}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onChange={event => onChange?.(event.currentTarget.value, event)}
            />
        </div>
    )
})) as React.FunctionComponent<InputProps>

// Types ///////////////////////////////////////////////////////////////////////

export interface InputProps extends Omit<ElementProps<'input'>, 'onChange'> {
    type?: undefined | React.HTMLInputTypeAttribute
    label?: undefined | string
    value?: undefined | string
    autoComplete?: undefined | string
    autoFocus?: undefined | boolean
    tabIndex?: undefined | number
    onChange?: undefined | ((value: string, event: React.ChangeEvent<HTMLInputElement>) => void)
}
