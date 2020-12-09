import {classes} from '../react.js'
import React from 'react'
const {useCallback, useMemo} = React

import './radio.css'

export let GroupId = 0

export function RadioGroup(props: RadioGroupProps) {
    const {items, selected, onChange, ...otherProps} = props

    const id = useMemo(() => {
        return ++GroupId
    }, [])

    const onClick = useCallback((value: string, idx) => {
        if (selected === value) {
            return
        }
        onChange?.(value, idx)
    }, [selected])

    return (
        <ul
            {...otherProps}
            className={classes('list-e37bad', props.className)}
        >
            {(items ?? []).map((it, idx) => {
                const isSelected = selected === it.value

                return (
                    <li
                        key={idx}
                        className={classes('item-bf74a1', {selected: isSelected})}
                        onClick={() => onClick(it.value, idx)}
                    >
                        <input
                            className="radio-137014"
                            type="radio"
                            name={`radio-group-${id}`}
                            value={it.value}
                            checked={isSelected}
                            readOnly={true}
                        />
                        <label className="label-b0ada3">
                            {it.label}
                        </label>
                    </li>
                )
            })}
        </ul>
    )
}

// Types ///////////////////////////////////////////////////////////////////////


export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    selected?: null | string
    items?: null | Array<{
        label: React.ReactNode
        value: string
    }>
    onChange?(value: string, idx: number): void
}
