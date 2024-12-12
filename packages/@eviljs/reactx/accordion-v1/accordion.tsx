import {Box, type BoxProps} from '@eviljs/react/box'
import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import {KeyboardKey} from '@eviljs/web/keybinding'
import {Children, cloneElement, isValidElement, useCallback, useEffect, useRef, useState} from 'react'
import {animateAccordionClose, animateAccordionOpen} from './accordion.api.js'

export function AccordionList(props: Props<AccordionListProps>): React.JSX.Element {
    const {
        className,
        children,
        initialOpen,
        maxOpen: maxOpenOptional,
        open: openControlled,
        onOpenChange: setOpenControlled,
        ...otherProps
    } = props

    const maxOpen = maxOpenOptional ?? 1

    const accordionsButtonsRef = useRef<Array<null | HTMLButtonElement>>([])

    const [openListUncontrolled, setOpenListUncontrolled] = useState<Array<number>>(initialOpen ?? [])
    const [focused, setFocused] = useState<number>()

    const openList = openControlled ?? openListUncontrolled

    function setOpenList(open: Array<number>) {
        setOpenListUncontrolled(open)
        setOpenControlled?.(open)
    }

    const accordionsList = Children.toArray(children).filter(isValidElement<AccordionProps>)

    function onKeyDown(event: React.KeyboardEvent<HTMLElement>, idx: number) {
        switch (event.key) {
            case KeyboardKey.ArrowUp:
                event.preventDefault()
                event.stopPropagation()
                setFocused(Math.max(idx - 1, 0))
            break
            case KeyboardKey.ArrowDown:
                event.preventDefault()
                event.stopPropagation()
                setFocused(Math.min(idx + 1, accordionsList.length - 1))
            break
            case KeyboardKey.ArrowLeft:
                event.preventDefault()
                event.stopPropagation()
                setOpenList(
                    openList.includes(idx)
                        ? openList.filter(it => it !== idx)
                        : openList
                )
            break
            case KeyboardKey.ArrowRight:
                event.preventDefault()
                event.stopPropagation()
                setOpenList(
                    openList.includes(idx)
                        ? openList
                        : [idx, ...openList].slice(0, maxOpen)
                )
            break
        }
    }

    function onAccordionOpenChange(idx: number, open: boolean) {
        setOpenList(
            open
                ? [idx, ...openList].slice(0, maxOpen)
                : openList.filter(it => it !== idx)
        )
    }

    function computeTabIndex(idx: number) {
        if (idx === 0 && focused === undefined) {
            return 0
        }
        if (idx === focused) {
            // Only last focused position should be focusable.
            return 0
        }
        return -1
    }

    useEffect(() => {
        accordionsButtonsRef.current = accordionsButtonsRef.current.slice(0, accordionsList.length)
    }, [accordionsList.length])

    useEffect(() => {
        if (focused === undefined) {
            return
        }

        const accordionButton = accordionsButtonsRef.current[focused]

        accordionButton?.focus()
    }, [focused])

    return (
        <ul
            {...otherProps}
            className={classes('AccordionList-c2ae', className)}
        >
            {accordionsList.map((accordion, idx) =>
                cloneElement(accordion, {
                    ...accordion.props,
                    key: idx,
                    tag: 'li',
                    className: classes('accordion-c3bf', accordion.props.className),
                    buttonProps: {
                        ...accordion.props.buttonProps,
                        ref(ref) {
                            accordionsButtonsRef.current[idx] = ref
                            // FIXME: Merge props.ref in React 19.
                        },
                        tabIndex: computeTabIndex(idx),
                        onKeyDown(event) {
                            accordion.props.buttonProps?.onKeyDown?.(event)
                            onKeyDown(event, idx)
                        },
                    },
                    open: openList.includes(idx),
                    onOpenChange(open) {
                        accordion.props.onOpenChange?.(open)
                        onAccordionOpenChange(idx, open)
                    },
                } satisfies AccordionProps)
            )}
        </ul>
    )
}

export function Accordion(props: AccordionProps): React.JSX.Element {
    const {
        buttonProps,
        children,
        className,
        content,
        contentClass,
        contentProps,
        contentStyle,
        initialOpen,
        open: openControlled,
        onOpenChange: setOpenControlled,
        ...otherProps
    } = props

    const contentRef = useRef<HTMLDivElement>(null)

    const [openUncontrolled, setOpenUncontrolled] = useState(initialOpen ?? false)

    const open = openControlled ?? openUncontrolled

    const setOpen = useCallback((open: boolean) => {
        setOpenUncontrolled(open)
        setOpenControlled?.(open)
    }, [setOpenControlled, setOpenUncontrolled])

    useEffect(() => {
        if (! contentRef.current) {
            return
        }

        if (open) {
            animateAccordionOpen(contentRef.current)
        }
        else {
            animateAccordionClose(contentRef.current)
        }
    }, [open])

    return (
        <Box
            {...otherProps}
            className={classes('Accordion-de4f std-flex std-flex-column', className)}
            aria-expanded={open}
        >
            <button
                type="button"
                {...buttonProps}
                className={classes('head-ad0d', buttonProps?.className)}
                onClick={event => {
                    buttonProps?.onClick?.(event)

                    setOpen(! open)
                }}
            >
                {children}
            </button>

            <div
                {...contentProps}
                ref={contentRef}
                className={classes('content-38aa', contentClass, contentProps?.className)}
                style={{...contentStyle, ...contentProps?.style}}
            >
                {content}
            </div>
        </Box>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AccordionListProps extends ElementProps<'ul'> {
    initialOpen?: undefined | Array<number>
    open?: undefined | Array<number>
    maxOpen?: undefined | number
    onOpenChange?: undefined | ((open: Array<number>) => void)
}

export interface AccordionProps extends Omit<BoxProps, 'content'> {
    buttonProps?: undefined | ElementProps<'button'>
    content: React.ReactNode
    contentClass?: undefined | string
    contentProps?: undefined | ElementProps<'div'>
    contentStyle?: undefined | React.CSSProperties
    initialOpen?: undefined | boolean
    open?: undefined | boolean
    onOpenChange?: undefined | ((open: boolean) => void)
}
