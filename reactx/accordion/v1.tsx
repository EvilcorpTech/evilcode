import {classes} from '@eviljs/std-react/react.js'
import React from 'react'
const {useEffect, useRef, useState} = React

import './v1.css'

export function Accordion<I>(props: AccordionProps<I>) {
    const {items, children, header, maxOpen, ...otherProps} = props
    const sectionsRef = useRef<Array<null | HTMLButtonElement>>([])
    const [selected, setSelected] = useState([0])
    const [focused, setFocused] = useState<null | number>(null)
    const maxOpenSections = maxOpen ?? 1

    useEffect(() => {
        sectionsRef.current = sectionsRef.current.slice(0, items.length)
    }, [items.length])

    useEffect(() => {
        if (focused === null) {
            return
        }

        const el = sectionsRef.current[focused]

        el?.focus()
    }, [focused])

    function toggleSelected(idx: number) {
        setSelected(
            selected.includes(idx)
                ? selected.filter(it => it !== idx)
                : [...selected, idx].slice(-1 * maxOpenSections)
        )
    }

    return (
        <ul
            {...otherProps}
            className={classes('Accordion-c2ae', props.className)}
        >
            {items.map((it, idx) =>
                <li
                    key={idx}
                    className={classes('section-c3bf', {
                        selected: selected.includes(idx),
                    })}
                >
                    <button
                        className="head-ad0d"
                        ref={(ref) => sectionsRef.current[idx] = ref}
                        tabIndex={idx === focused || focused === null
                            ? 0
                            : -1
                        }
                        onKeyDown={(event) => {
                            switch (event.key) {
                                case 'ArrowDown':
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setFocused(Math.min(idx + 1, items.length - 1))
                                break
                                case 'ArrowUp':
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setFocused(Math.max(idx - 1, 0))
                                break
                                case 'ArrowRight':
                                    setSelected(
                                        selected.includes(idx)
                                            ? selected
                                            : [...selected, idx].slice(-1 * maxOpenSections)
                                    )
                                break
                                case 'ArrowLeft':
                                    setSelected(
                                        selected.includes(idx)
                                            ? selected.filter(it => it !== idx)
                                            : selected
                                    )
                                break
                            }
                        }}
                        onClick={() => toggleSelected(idx)}
                    >
                        {header(it, idx)}
                    </button>

                    <div className="content-38aa">
                        {children(it, idx)}
                    </div>
                </li>
            )}
        </ul>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AccordionProps<I> extends React.HTMLAttributes<HTMLUListElement> {
    children(it: I, idx: number): React.ReactNode
    header(it: I, idx: number): React.ReactNode
    items: Array<I>
    maxOpen?: number
}
