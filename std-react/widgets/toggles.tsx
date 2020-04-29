import { className } from '../react'
import { createElement, useCallback, useEffect, useState } from 'react'

import './toggles.css'

export function Toggles(props: TogglesProps) {
    const { message, items, selected, max, onChange, ...otherProps } = props
    const [ selectedItems, setSelectedItems ] = useState<Array<string>>([])

    useEffect(() => {
        setSelectedItems(selected ?? [])
    }, [selected])

    const onClick = useCallback((event: ClickEvent) => {
        const target = event.currentTarget
        const id = target.dataset.id!

        function limit(state: Array<string>) {
            return max
                ? state.slice(-max)
                : state
        }

        const state = selectedItems.includes(id)
            ? selectedItems.filter(it =>  it !== id)
            : limit([...selectedItems, id])

        setSelectedItems(state)
        onChange?.(state)
    }, [selectedItems])

    return (
        <div
            {...otherProps}
            {...className('toggles-s4178a select', props.className)}
        >
            <label className="select-label">
                {message}
            </label>

            <div className="list-s8ad55">
                {items.map(it => (
                    <div
                        key={it.id}
                        {...className('toggle-c9313e', {
                            selected: selectedItems.includes(it.id),
                        })}
                        data-id={it.id}
                        onClick={onClick}
                    >
                        {it.name}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TogglesProps {
    className?: string
    message?: string
    items: Array<{id: string, name: string}>
    selected?: Array<string>
    max?: number
    onChange?(selected: Array<string>): void
    [key: string]: any
}

type ClickEvent<E = HTMLDivElement> = React.MouseEvent<E, MouseEvent>
