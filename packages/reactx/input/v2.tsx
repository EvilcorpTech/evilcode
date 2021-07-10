import {classes} from '@eviljs/react/react.js'
import {useRef, useState, Fragment} from 'react'
import {Button} from '../button/v1.js'

import './v2.css'

export function InputLabel(props: InputLabelProps) {
    const {children, className, labelClass, title, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('InputLabel-5738', className)}
        >
            <label className={classes('label-b082 std-text-body2 std-color-front2', labelClass)}>
                {title}
            </label>

            {children}
        </div>
    )
}

export function Input(props: InputProps) {
    const {className, decorate, disabled, inputClass, ...otherProps} = props
    const elRef = useRef<HTMLInputElement>(null)

    const render = decorate
        ? decorate
        : (input: React.ReactNode) => input

    return (
        <div
            className={classes('Input-cc0a std-flex align-center', className)}
            onClick={() => elRef.current?.focus()}
        >
            {render(
                <input
                    {...otherProps}
                    ref={elRef}
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
    const {className, decorate, hideIcon, showIcon, ...otherProps} = props
    const [visible, setVisible] = useState(false)

    return (
        <Input
            {...otherProps}
            type={visible ? 'text' : 'password'}
            className={classes('SecretInput-b91c', className)}
            decorate={(input) =>
                <Fragment>
                    {decorate?.(input) ?? input}
                    <Button
                        className="button-2bdf"
                        tabIndex={-1}
                        onClick={() => setVisible(! visible)}
                    >
                        {visible
                            ? hideIcon
                            : showIcon
                        }
                    </Button>
                </Fragment>
            }
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
        return (
            <Fragment>
                {sides?.start}
                {element}
                {sides?.end}
            </Fragment>
        )
    }

    return decorator
}

// Types ///////////////////////////////////////////////////////////////////////

export interface InputLabelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'labelClass'> {
    title: React.ReactNode
    labelClass?: string
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    decorate?(input: React.ReactNode): React.ReactNode
    inputClass?: string
}

export interface TextInputProps extends InputProps {
}

export interface SecretInputProps extends InputProps {
    showIcon: React.ReactNode
    hideIcon: React.ReactNode
}
