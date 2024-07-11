import {classes} from '@eviljs/react/classes.js'
import {displayName} from '@eviljs/react/display-name.js'
import {useMergeRefs} from '@eviljs/react/ref.js'
import type {VoidProps} from '@eviljs/react/type.js'
import {identity} from '@eviljs/std/fn-return.js'
import {forwardRef, useRef, useState} from 'react'

export {decoratingElement, decoratingElementAfter, decoratingElementBefore} from '@eviljs/react/children.js'

export function InputLabel(props: InputLabelProps): JSX.Element {
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
    props: Omit<InputProps, 'ref'>,
    ref: React.ForwardedRef<HTMLInputElement>,
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
                    onChange={event => onChange?.(event.currentTarget.value)}
                />
            )}
        </div>
    )
})) as React.FunctionComponent<InputProps>

export const TextInput = displayName('TextInput', forwardRef(function TextInput(
    props: Omit<TextInputProps, 'ref'>,
    ref: React.ForwardedRef<HTMLInputElement>,
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
    props: Omit<SecretInputProps, 'ref'>,
    ref: React.ForwardedRef<HTMLInputElement>,
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

export interface InputLabelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'labelClass'> {
    title: React.ReactNode
    labelClass?: string
}

export interface InputProps extends VoidProps<Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>>, React.RefAttributes<HTMLInputElement> {
    decorate?: undefined | ((input: React.ReactNode) => React.ReactNode)
    hostClass?: undefined | string
    hostProps?: undefined | React.HTMLAttributes<HTMLElement>
    hostStyle?: undefined | React.CSSProperties
    onChange?: undefined | ((event: string) => void)
}

export interface TextInputProps extends InputProps {
}

export interface SecretInputProps extends InputProps {
    buttonClass?: undefined | string
    buttonStyle?: undefined | React.CSSProperties
    buttonProps?: undefined | VoidProps<React.ButtonHTMLAttributes<HTMLButtonElement>>
    showIcon: React.ReactNode
    hideIcon: React.ReactNode
}
