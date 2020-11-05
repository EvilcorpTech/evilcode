import {classes} from '../react.js'
import React from 'react'
const {useMemo} = React

import './radio.css'

export let GroupId = 0

export function RadioGroup(props: RadioGroupProps) {
    const {items, selected, onChange, ...otherProps} = props

    const id = useMemo(() => {
        return ++GroupId
    }, [])

    return (
        <ul
            {...otherProps}
            className={classes('list-e37bad', props.className)}
        >
            {(items ?? []).map((it, idx) =>
                <li
                    key={idx}
                    className="item-bf74a1"
                >
                    <input
                        className="radio-137014"
                        type="radio"
                        name={`radio-group-${id}`}
                        value={it.value}
                        checked={selected === it.value || selected === idx
                            ? true
                            : false
                        }
                        onChange={() => onChange?.(it.value, idx)}
                    />
                    <label
                        className="label-b0ada3"
                        onClick={() => onChange?.(it.value, idx)}
                    >
                        {it.label}
                    </label>
                </li>
            )}
        </ul>
    )
}

// Types ///////////////////////////////////////////////////////////////////////


export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    selected?: string | number | null | undefined
    items?: null | Array<{
        label: React.ReactNode
        value: string
    }>
    onChange?(value: string, idx: number): void
}
