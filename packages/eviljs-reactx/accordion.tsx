import './accordion.css'

import {Box, BoxProps} from '@eviljs/react/box.js'
import {asArray} from '@eviljs/std/type.js'
import {flushStyles} from '@eviljs/web/animation.js'
import {classes} from '@eviljs/web/classes.js'
import {Children, isValidElement, useCallback, useEffect, useRef, useState} from 'react'

export function AccordionList(props: AccordionListProps) {
    const {className, children, initial, maxOpen, onChange, ...otherProps} = props
    const itemsRef = useRef<Array<null | HTMLButtonElement>>([])
    const [selected, setSelected] = useState(initial ?? [])
    const [focused, setFocused] = useState<null | number>(null)
    const maxOpenSections = maxOpen ?? 1
    const childrenList = asArray(children)

    function onKeyDown(event: React.KeyboardEvent<HTMLElement>, idx: number) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                event.stopPropagation()
                setFocused(Math.min(idx + 1, childrenList.length - 1))
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
    }

    function onToggle(idx: number) {
        setSelected(
            selected.includes(idx)
                ? selected.filter(it => it !== idx)
                : [...selected, idx].slice(-1 * maxOpenSections)
        )
    }

    function computeTabIndex(idx: number) {
        if (idx === focused) {
            // Only last focused position should be focusable.
            return 0
        }
        if (focused === null && idx === 0) {
            return 0
        }
        return -1
    }

    useEffect(() => {
        itemsRef.current = itemsRef.current.slice(0, childrenList.length)
    }, [childrenList.length])

    useEffect(() => {
        if (focused === null) {
            return
        }

        const el = itemsRef.current[focused]

        el?.focus()
    }, [focused])

    useEffect(() => {
        if (selected === initial) {
            return
        }
        onChange?.(selected)
    }, [selected])

    return (
        <ul
            {...otherProps}
            className={classes('AccordionList-c2ae', className)}
        >
            {Children.map(children, (it, idx) => {
                if (! isValidElement(it)) {
                    return null
                }

                const isSelected = selected.includes(idx)

                return (
                    <AccordionItem
                        {...it.props}
                        key={idx}
                        tag="li"
                        className={classes('item-c3bf', it.props.className, {
                            selected: isSelected,
                        })}
                        buttonProps={{
                            ...it.props.buttonProps,
                            ref(ref) {
                                itemsRef.current[idx] = ref
                            },
                            tabIndex: computeTabIndex(idx),
                            onKeyDown(event) {
                                onKeyDown(event, idx)
                            },
                        }}
                        selected={isSelected}
                        onToggle={() => onToggle(idx)}
                    />
                )
            })}
        </ul>
    )
}

export function Accordion(props: AccordionProps) {
    const {onToggle, ...otherProps} = props
    const [selected, setSelected] = useState(false)

    useEffect(() => {
        onToggle?.(selected)
    }, [selected])

    return (
        <AccordionItem
            {...otherProps}
            selected={selected}
            onToggle={setSelected}
        />
    )
}

export function AccordionItem(props: AccordionItemProps) {
    const {
        buttonProps,
        contentProps,
        children,
        className,
        head,
        selected,
        onToggle,
        ...otherProps
    } = props
    const contentRef = useRef<HTMLDivElement>(null)

    const onOpen = useCallback(() => {
        const content = contentRef.current

        if (! content) {
            return
        }

        content.ontransitionend = () => {
            content.style.height = 'auto'
            content.ontransitionend = null
        }

        content.style.height = content.scrollHeight + 'px'
    }, [])

    const onClose = useCallback(() => {
        const content = contentRef.current

        if (! content) {
            return
        }

        content.style.height = content.scrollHeight + 'px'
        flushStyles(content)

        content.ontransitionend = () => {
            content.style.height = ''
            content.ontransitionend = null
        }

        content.style.height = '0px'
    }, [])

    useEffect(() => {
        if (selected) {
            onOpen()
        } else {
            onClose()
        }
    }, [selected, onOpen, onClose])

    return (
        <Box
            {...otherProps}
            className={classes('AccordionItem-de4f std-flex column', className, {
                'selected': selected,
            })}
        >
            <button
                {...buttonProps}
                className={classes('head-ad0d', buttonProps?.className)}
                onClick={() => onToggle(! selected)}
            >
                {head}
            </button>

            <div
                {...contentProps}
                ref={contentRef}
                className={classes('content-38aa', contentProps?.className)}
            >
                {children}
            </div>
        </Box>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AccordionListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onChange'> {
    children?: undefined | null | React.ReactElement<AccordionProps> | Array<React.ReactElement<AccordionProps>>
    initial?: Array<number>
    maxOpen?: number
    onChange?: (list: Array<number>) => void
}

export interface AccordionProps extends BoxProps {
    head: React.ReactNode
    buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement> & {ref: React.Ref<HTMLButtonElement>}
    contentProps?: React.HTMLAttributes<HTMLDivElement>
    onToggle?: (state: boolean) => void
}

export interface AccordionItemProps extends AccordionProps {
    selected: boolean
    onToggle(state: boolean): void
}
