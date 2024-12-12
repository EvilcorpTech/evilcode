import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props, VoidProps} from '@eviljs/react/props'
import {useMergeRefs} from '@eviljs/react/ref'
import {identity} from '@eviljs/std/fn-return'
import {useRef, useState} from 'react'

export {decoratingElement, decoratingElementAfter, decoratingElementBefore} from '@eviljs/react/children'

export function InputLabel(props: Props<InputLabelProps>): React.JSX.Element {
    const {children, className, labelClass, title, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('InputLabel-5738', className)}
        >
            <label className={classes('label-b082 std-text-body2 std-color-fg2', labelClass)}>
                {title}
            </label>

            {children}
        </div>
    )
}

export function Input(props: Props<InputProps>): React.JSX.Element {
    const {
        className,
        decorate,
        disabled: disabledOptional,
        hostClass,
        hostProps,
        hostStyle,
        inputClass,
        inputProps,
        inputStyle,
        readOnly: readonlyOptional,
        ref: refOptional,
        required: requiredOptional,
        onChange,
        ...otherProps
    } = props

    const inputRef = useRef<HTMLInputElement>(null)
    const inputRefMerged = useMergeRefs(inputRef, refOptional)

    const disabled = disabledOptional ?? false
    const readonly = readonlyOptional ?? false
    const required = requiredOptional ?? false

    const renderInput = decorate ?? identity

    return (
        <div
            aria-disabled={disabled}
            aria-readonly={readonly}
            aria-required={required}
            {...hostProps}
            className={classes('Input-cc0a', className, hostClass, hostProps?.className)}
            style={{...hostStyle, ...hostProps?.style}}
            onClick={event => {
                hostProps?.onClick?.(event)
                inputRef.current?.focus()
            }}
        >
            {renderInput(
                <input
                    {...otherProps}
                    ref={inputRefMerged}
                    className={classes('input-2d2b', inputClass, inputProps?.className)}
                    disabled={disabled}
                    readOnly={readonly}
                    required={required}
                    style={{...inputStyle, ...inputProps?.style}}
                    onChange={event => onChange?.(event.currentTarget.value, event)}
                />
            )}
        </div>
    )
}

export function TextInput(props: Props<TextInputProps>): React.JSX.Element {
    const {className, ...otherProps} = props

    return (
        <Input
            type="text"
            {...otherProps}
            className={classes('TextInput-1330', className)}
        />
    )
}

export function SecretInput(props: Props<SecretInputProps>): React.JSX.Element {
    const {buttonClass, buttonProps, buttonStyle, className, decorate, hideIcon, showIcon, ...otherProps} = props
    const [visible, setVisible] = useState(false)

    return (
        <Input
            {...otherProps}
            type={visible ? 'text' : 'password'}
            className={classes('SecretInput-b91c', className)}
            decorate={input => <>
                {decorate?.(input) ?? input}

                <button
                    type="button"
                    tabIndex={-1}
                    {...buttonProps}
                    className={classes('button-2bdf', buttonClass, buttonProps?.className)}
                    style={{
                        ...buttonStyle,
                        ...buttonProps?.style,
                    }}
                    onClick={event => {
                        setVisible(! visible)
                        buttonProps?.onClick?.(event)
                    }}
                >
                    {visible
                        ? hideIcon
                        : showIcon
                    }
                </button>
            </>}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface InputLabelProps extends Omit<ElementProps<'div'>, 'labelClass' | 'title'> {
    labelClass?: string
    title: React.ReactNode
}

export interface InputProps extends Omit<VoidProps<ElementProps<'input'>>, 'onChange'> {
    decorate?: undefined | ((input: React.ReactNode) => React.ReactNode)
    hostClass?: undefined | string
    hostProps?: undefined | ElementProps<'div'>
    hostStyle?: undefined | React.CSSProperties
    inputClass?: undefined | string
    inputProps?: undefined | ElementProps<'input'>
    inputStyle?: undefined | React.CSSProperties
    onChange?: undefined | ((value: string, event: React.ChangeEvent<HTMLInputElement>) => void)
}

export interface TextInputProps extends InputProps {
}

export interface SecretInputProps extends InputProps {
    buttonClass?: undefined | string
    buttonProps?: undefined | VoidProps<ElementProps<'button'>>
    buttonStyle?: undefined | React.CSSProperties
    hideIcon: React.ReactNode
    showIcon: React.ReactNode
}
