import './decorated.css'

import {classes} from '@eviljs/react/classes.js'
import {useMergeRefs} from '@eviljs/react/ref.js'
import {identity} from '@eviljs/std/return.js'
import {forwardRef, useRef, useState} from 'react'
import {Button} from '../button.js'

export function InputLabel(props: InputLabelProps) {
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

export const Input = forwardRef(function Input(
    props: InputProps,
    ref?: undefined | React.Ref<HTMLInputElement>,
) {
    const {className, decorate, disabled, inputClass, onChange, ...otherProps} = props
    const inputRef = useRef<HTMLInputElement>(null)
    const render = decorate ?? identity

    return (
        <div
            className={classes('Input-cc0a', className)}
            onClick={() => inputRef.current?.focus()}
        >
            {render(
                <input
                    onChange={event => onChange?.(event.currentTarget.value)}
                    {...otherProps}
                    ref={useMergeRefs(inputRef, ref)}
                    className={classes('input-2d2b', inputClass)}
                    disabled={disabled}
                />
            )}
        </div>
    )
})
Input.displayName = 'Input'

export const TextInput = forwardRef(function TextInput(
    props: TextInputProps,
    ref?: undefined | React.Ref<HTMLInputElement>,
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
})
TextInput.displayName = 'TextInput'

export const SecretInput = forwardRef(function SecretInput(
    props: SecretInputProps,
    ref?: undefined | React.Ref<HTMLInputElement>,
) {
    const {buttonClass, buttonStyle, className, decorate, hideIcon, showIcon, ...otherProps} = props
    const [visible, setVisible] = useState(false)

    return (
        <Input
            {...otherProps}
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={classes('SecretInput-b91c', className)}
            decorate={input => <>
                {decorate?.(input) ?? input}

                <Button
                    className={classes('button-2bdf', buttonClass)}
                    tabIndex={-1}
                    style={buttonStyle}
                    onClick={() => setVisible(! visible)}
                >
                    {visible
                        ? hideIcon
                        : showIcon
                    }
                </Button>
            </>}
        />
    )
})
SecretInput.displayName = 'SecretInput'

export function decoratingStart(children: React.ReactNode) {
    return decoratingSides({start: children})
}

export function decoratingEnd(children: React.ReactNode) {
    return decoratingSides({end: children})
}

export function decoratingSides(sides: {start?: React.ReactNode, end?: React.ReactNode}) {
    function decorator(element: React.ReactNode) {
        return <>
            {sides?.start}
            {element}
            {sides?.end}
        </>
    }

    return decorator
}

// Types ///////////////////////////////////////////////////////////////////////

export interface InputLabelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'labelClass'> {
    title: React.ReactNode
    labelClass?: string
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    decorate?: undefined | ((input: React.ReactNode) => React.ReactNode)
    inputClass?: undefined | string
    onChange?: undefined | ((event: string) => void)
}

export interface TextInputProps extends InputProps {
}

export interface SecretInputProps extends InputProps {
    buttonClass?: undefined | string
    buttonStyle?: undefined | React.CSSProperties
    showIcon: React.ReactNode
    hideIcon: React.ReactNode
}
