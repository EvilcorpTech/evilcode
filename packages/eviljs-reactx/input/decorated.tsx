import './decorated.css'

import {identity} from '@eviljs/std/fn.js'
import {classes} from '@eviljs/web/classes.js'
import {useRef, useState} from 'react'
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

export function Input(props: InputProps) {
    const {className, decorate, disabled, inputClass, onChange, ...otherProps} = props
    const inputRef = useRef<HTMLInputElement>(null)
    const render = decorate ?? identity

    return (
        <div
            className={classes('Input-cc0a std-flex align-center', className)}
            onClick={() => inputRef.current?.focus()}
        >
            {render(
                <input
                    onChange={event => onChange?.(event.currentTarget.value)}
                    {...otherProps}
                    ref={inputRef}
                    className={classes('input-2d2b', inputClass)}
                    disabled={disabled}
                />
            )}
        </div>
    )
}

export function TextInput(props: TextInputProps) {
    const {className, ...otherProps} = props

    return (
        <Input
            type="text"
            {...otherProps}
            className={classes('TextInput-1330', className)}
        />
    )
}

export function SecretInput(props: SecretInputProps) {
    const {buttonClass, buttonStyle, className, decorate, hideIcon, showIcon, ...otherProps} = props
    const [visible, setVisible] = useState(false)

    return (
        <Input
            {...otherProps}
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
}

export function decorateStart(children: React.ReactNode) {
    return decorateSides({start: children})
}

export function decorateEnd(children: React.ReactNode) {
    return decorateSides({end: children})
}

export function decorateSides(sides: {start?: React.ReactNode, end?: React.ReactNode}) {
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
