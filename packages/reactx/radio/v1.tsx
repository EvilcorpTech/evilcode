import {classes} from '@eviljs/react/react.js'
import React from 'react'
const {useCallback, useMemo} = React

import './v1.css'

export let GroupId = 0

export function RadioGroup(props: RadioGroupProps) {
    const {className, items, selected, onChange, ...otherProps} = props

    const id = useMemo(() => {
        return ++GroupId
    }, [])

    return (
        <div
            {...otherProps}
            className={classes('RadioGroup-e37b', className)}
        >
            {(items ?? []).map((it, idx) => {
                const isSelected = selected === it.value

                return (
                    <label
                        key={idx}
                        className={classes('item-bf74 std-flex align-center', {selected: isSelected})}
                    >
                        <input
                            className="radio-1370"
                            type="radio"
                            name={`radio-group-${id}`}
                            value={it.value}
                            checked={isSelected}
                            // readOnly={true}
                            onChange={(event) => onChange?.(event.target.value, idx)}
                        />
                        <span className="label-b0ad">
                            {it.label}
                        </span>
                    </label>
                )
            })}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////


export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    selected?: null | string
    items?: null | Array<{
        value: string
        label: React.ReactNode
    }>
    onChange?(value: string, idx: number): void
}
