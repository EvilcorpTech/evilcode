import {classes} from '@eviljs/react/classes'
import {displayName} from '@eviljs/react/display-name'
import type {ElementProps, Props, RefElementOf, VoidProps} from '@eviljs/react/props'
import {useMergeRefs} from '@eviljs/react/ref'
import {identity} from '@eviljs/std/fn-return'
import {forwardRef, useRef, useState} from 'react'

export {decoratingElement, decoratingElementAfter, decoratingElementBefore} from '@eviljs/react/children'

export function InputLabel(props: Props<InputLabelProps>): JSX.Element {
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

export const Input = displayName('Input', forwardRef(function Input(
    props: Props<InputProps>,
    ref: React.ForwardedRef<RefElementOf<InputProps>>,
) {
    const {className, decorate, hostClass, hostProps, hostStyle, onChange, ...otherProps} = props
    const inputRef = useRef<HTMLInputElement>(null)
    const render = decorate ?? identity

    return (
        <div
            {...hostProps}
            className={classes('Input-cc0a', hostClass, hostProps?.className)}
            style={{...hostStyle, ...hostProps?.style}}
            onClick={event => {
                inputRef.current?.focus()
                hostProps?.onClick?.(event)
            }}
        >
            {render(
                <input
                    {...otherProps}
                    ref={useMergeRefs(inputRef, ref)}
                    className={classes('input-2d2b', className)}
                    onChange={event => onChange?.(event.currentTarget.value, event)}
                />
            )}
        </div>
    )
})) as React.FunctionComponent<InputProps>

export const TextInput = displayName('TextInput', forwardRef(function TextInput(
    props: Props<TextInputProps>,
    ref: React.ForwardedRef<RefElementOf<TextInputProps>>,
) {
    const {className, ...otherProps} = props

    return (
        <Input
            type="text"
            {...otherProps}
            ref={ref}
            className={classes('TextInput-1330', className)}
        />
    )
})) as React.FunctionComponent<TextInputProps>

export const SecretInput = displayName('SecretInput', forwardRef(function SecretInput(
    props: Props<SecretInputProps>,
    ref: React.ForwardedRef<RefElementOf<SecretInputProps>>,
) {
    const {buttonClass, buttonProps, buttonStyle, className, decorate, hideIcon, showIcon, ...otherProps} = props
    const [visible, setVisible] = useState(false)

    return (
        <Input
            {...otherProps}
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={classes('SecretInput-b91c', className)}
            decorate={input => <>
                {decorate?.(input) ?? input}

                <button
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
})) as React.FunctionComponent<SecretInputProps>

// Types ///////////////////////////////////////////////////////////////////////

export interface InputLabelProps extends Omit<ElementProps<'div'>, 'title' | 'labelClass'> {
    title: React.ReactNode
    labelClass?: string
}

export interface InputProps extends Omit<VoidProps<ElementProps<'input'>>, 'onChange'> {
    decorate?: undefined | ((input: React.ReactNode) => React.ReactNode)
    hostClass?: undefined | string
    hostProps?: undefined | ElementProps<'div'>
    hostStyle?: undefined | React.CSSProperties
    onChange?: undefined | ((value: string, event: React.ChangeEvent<HTMLInputElement>) => void)
}

export interface TextInputProps extends InputProps {
}

export interface SecretInputProps extends InputProps {
    buttonClass?: undefined | string
    buttonStyle?: undefined | React.CSSProperties
    buttonProps?: undefined | VoidProps<ElementProps<'button'>>
    showIcon: React.ReactNode
    hideIcon: React.ReactNode
}
