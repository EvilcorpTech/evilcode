import {defineContext} from '@eviljs/react/ctx'
import {useClickOutside} from '@eviljs/react/gesture'
import {call} from '@eviljs/std/fn-call'
import {compute, type Computable} from '@eviljs/std/fn-compute'
import {clamp} from '@eviljs/std/math'
import {isArray, isUndefined} from '@eviljs/std/type-is'
import type {ObjectPartial} from '@eviljs/std/type-types'
import {classes} from '@eviljs/web/classes'
import {KeyboardKey} from '@eviljs/web/keybinding'
import {useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type AriaRole} from 'react'
import type {SelectOptionGeneric, SelectPlacement} from './select.api.js'

const NoItems: [] = []

export const SelectContext: React.Context<undefined | SelectContextValueGeneric> = (
    defineContext<SelectContextValueGeneric>('SelectContext')
)

export function useSelectOneContext<I extends SelectOptionGeneric<any>>(): undefined | SelectContextValue<I, undefined | I> {
    return useContext(SelectContext) as undefined | SelectContextValue<I, undefined | I>
}

export function useSelectManyContext<I extends SelectOptionGeneric<any>>(): undefined | SelectContextValue<I, Array<I>> {
    return useContext(SelectContext) as undefined | SelectContextValue<I, Array<I>>
}

export function useSelectOneProvider<I extends SelectOptionGeneric<any>>(
    args: SelectOneProviderOptions<I>,
): SelectContextValue<I, undefined | I> {
    const {
        initialOpen,
        initialSelected,
        open: openControlled,
        selected: selectedControlled,
        setOpen: setOpenControlled,
        setSelected: setSelectedControlled,
        ...otherArgs
    } = args
    const [openUncontrolled, setOpenUncontrolled] = useState<boolean>(initialOpen ?? openControlled ?? false)
    const [selectedUncontrolled, setSelectedUncontrolled] = useState<undefined | I>(initialSelected)

    const open = openControlled ?? openUncontrolled
    const selected = selectedControlled ?? selectedUncontrolled

    const setOpen = useCallback((open: boolean) => {
        setOpenUncontrolled(open)
        setOpenControlled?.(open)
    }, [setOpenUncontrolled, setOpenControlled])

    const setSelected = useCallback((selected: undefined | I) => {
        setSelectedUncontrolled(selected)
        setSelectedControlled(selected)
    }, [setSelectedUncontrolled, setSelectedControlled])

    const clearSelected = useCallback(() => {
        setSelected(undefined)
    }, [setSelected])

    const onOptionSelection = useCallback((option: I, optionIdx: number, event: React.UIEvent<HTMLElement>) => {
        setSelected(option)
        setOpen(false)
    }, [setSelected, setOpen])

    return useSelectGenericProvider({
        ...otherArgs,
        open: open,
        selected: selected,
        clearSelected: clearSelected,
        setOpen: setOpen,
        setSelected: setSelected,
        onOptionSelection: onOptionSelection,
    })
}

export function useSelectManyProvider<I extends SelectOptionGeneric<any>>(
    args: SelectManyProviderOptions<I>,
): SelectContextValue<I, Array<I>> {
    const {
        initialOpen,
        initialSelected,
        open: openControlled,
        selected: selectedControlled,
        setOpen: setOpenControlled,
        setSelected: setSelectedControlled,
        ...otherArgs
    } = args
    const [openUncontrolled, setOpenUncontrolled] = useState<boolean>(initialOpen ?? openControlled ?? false)
    const [selectedUncontrolled, setSelectedUncontrolled] = useState<Array<I>>(initialSelected ?? NoItems)

    const open = openControlled ?? openUncontrolled
    const selected = selectedControlled ?? selectedUncontrolled

    const setOpen = useCallback((value: boolean) => {
        setOpenUncontrolled(value)
        setOpenControlled?.(value)
    }, [setOpenUncontrolled, setOpenControlled])

    const setSelected = useCallback((selected: Array<I>) => {
        setSelectedUncontrolled(selected)
        setSelectedControlled(selected)
    }, [setSelectedUncontrolled, setSelectedControlled])

    const clearSelected = useCallback(() => {
        setSelected(NoItems)
    }, [setSelected])

    const onOptionSelection = useCallback((option: I, optionIdx: number, event: React.UIEvent<HTMLElement>) => {
        setSelected(
            selected.some(it => it.value === option.value)
                ? selected.filter(it => it.value !== option.value)
                : [...selected, option]
        )
    }, [selected, setSelected, setOpen])

    return useSelectGenericProvider({
        ...otherArgs,
        open: open,
        selected: selected,
        clearSelected: clearSelected,
        setOpen: setOpen,
        setSelected: setSelected,
        onOptionSelection: onOptionSelection,
    })
}

export function useSelectGenericProvider<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>>(
    args: SelectProviderOptions<I, S>,
): SelectContextValue<I, S> {
    const [PRIVATE_optionFocused, PRIVATE_setOptionFocused] = useState<number>()
    const [PRIVATE_optionTabbed, PRIVATE_setOptionTabbed] = useState<number>()

    const refs = {
        rootRef: useRef<HTMLElement>(),
        controlRef: useRef<HTMLElement>(),
        optionsRootRef: useRef<HTMLElement>(),
        optionsListRef: useRef<HTMLElement>(),
        optionsRef: useRef<Array<undefined | HTMLElement>>(NoItems),
    }

    const state: SelectContextValue<I, S>['state'] = {
        disabled: args.disabled ?? false,
        mounted: args.mounted ?? false,
        open: args.open,
        optionFocused: PRIVATE_optionFocused,
        optionTabbed: PRIVATE_optionTabbed,
        placement: args.placement ?? 'center',
        readonly: args.readonly ?? false,
        required: args.required ?? false,
        selected: args.selected,
        teleport: args.teleport ?? false,
        valid: args.valid ?? true,
        clearSelected: args.clearSelected,
        setOpen() {},
        setOptionFocused: PRIVATE_setOptionFocused,
        setOptionTabbed: PRIVATE_setOptionTabbed,
        setSelected() {},
    }
    state.setOpen = useCallback((open: boolean) => {
        if (state.disabled) {
            return
        }
        /*
        * // Readonly select can be opened.
        * if (state.readonly) {
        *   return
        * }
        */

        args.setOpen(open)
    }, [state.disabled, state.readonly, args.setOpen])
    state.setSelected = useCallback((selected: S) => {
        if (state.disabled) {
            return
        }
        if (state.readonly) {
            return
        }

        args.setSelected(selected)
    }, [state.disabled, state.readonly, args.setSelected])

    const onOptionSelection = useCallback((option: I, optionIdx: number, event: React.UIEvent<HTMLElement>) => {
        if (state.disabled) {
            return
        }
        if (state.readonly) {
            return
        }
        if (option.disabled) {
            return
        }

        args.onOptionSelection(option, optionIdx, event)
    }, [state.disabled, state.readonly, args.onOptionSelection])

    const computedPropsContext: SelectComputablePropsContext<S> = {
        open: state.open,
        selected: state.selected,
    }

    const computedProps = {
        rootProps: compute(args.rootProps, computedPropsContext),
        controlProps: compute(args.controlProps, computedPropsContext),
        optionsRootProps: compute(args.optionsRootProps, computedPropsContext),
        optionsListProps: compute(args.optionsListProps, computedPropsContext),
        optionProps: compute(args.optionProps, computedPropsContext),
    }

    const optionsRootId = useId()

    const props: SelectContextValue<I, S>['props'] = {
        rootProps: {
            ...computedProps.rootProps,
            ref: useCallback((element: null | HTMLElement) => {
                refs.rootRef.current = element ?? undefined
                // mapSome(computedProps.rootProps?.ref, ref => setRef<null | HTMLElement>(ref, element)) // FIXME on React 19.
            }, [/*computedProps.rootProps?.ref*/]),
            className: classes(computedProps.rootProps?.className),
            ['aria-controls']: optionsRootId,
            ['aria-disabled']: state.disabled,
            ['aria-expanded']: state.open,
            ['data-placement']: state.placement,
            style: {
                ...call((): undefined | React.CSSProperties => {
                    if (state.teleport) {
                        return
                    }
                    if (state.open) {
                        return {
                            position: 'relative',
                            zIndex: 'var(--Select-root-zindex, var(--Select-root-zindex--default, 1))',
                        }
                    }
                    if (state.mounted) {
                        return {
                            position: 'relative',
                        }
                    }
                    return
                }),
                ...computedProps.rootProps?.style,
            },
            onBlur: useCallback((event: React.FocusEvent<HTMLElement>) => {
                if (state.disabled) {
                    return
                }
                /*
                * // Readonly select can be closed.
                * if (state.readonly) {
                *   return
                * }
                */
                if (refs.rootRef.current?.contains(event.relatedTarget)) {
                    // Focus is inside the options list.
                    return
                }

                computedProps.rootProps?.onBlur?.(event)

                // User is tabbing out of the select.
                state.setOpen(false)
            }, [state.disabled, state.readonly, state.setOpen, computedProps.rootProps?.onBlur]),
        },

        controlProps: {
            ...computedProps.controlProps,
            ref: useCallback((element: null | HTMLElement) => {
                refs.controlRef.current = element ?? undefined
                // mapSome(computedProps.controlProps?.ref, ref => setRef<null | HTMLElement>(ref, element)) // FIXME on React 19.
            }, [/* computedProps.controlProps?.ref */]),
            className: classes(computedProps.controlProps?.className),
            role: 'listbox',
            ['aria-invalid']: ! state.valid,
            ['aria-readonly']: state.readonly,
            ['aria-required']: state.required,
            tabIndex: state.disabled ? -1 : 0,
            onClick: useCallback((event: React.MouseEvent<HTMLElement>) => {
                if (state.disabled) {
                    return
                }
                /*
                * // Readonly select can be opened.
                * if (state.readonly) {
                *   return
                * }
                */
                /*
                * // Click target is never the control element, but always an element inside it.
                * if (event.target !== event.currentTarget) {
                *     return
                * }
                */

                computedProps.controlProps?.onClick?.(event)

                state.setOpen(! state.open)

                // On click we should reset focused/tabbed option.
                state.setOptionFocused(undefined)
                state.setOptionTabbed(undefined)
            }, [state.disabled, state.readonly, state.open, state.setOptionFocused, state.setOptionTabbed, computedProps.controlProps?.onClick]),
            onFocus: useCallback((event: React.FocusEvent<HTMLElement>) => {
                if (state.disabled) {
                    return
                }
                if (state.readonly) {
                    return
                }
                if (event.target !== event.currentTarget) {
                    return
                }

                computedProps.controlProps?.onFocus?.(event)

                state.setOptionFocused(undefined)
            }, [state.disabled, state.readonly, state.setOptionFocused, computedProps.controlProps?.onFocus]),
            onKeyDown: useCallback((event: React.KeyboardEvent<HTMLElement>) => {
                if (state.disabled) {
                    return
                }
                /*
                * // Readonly select can be opened.
                * if (state.readonly) {
                *   return
                * }
                */
                if (event.target !== event.currentTarget) {
                    return
                }

                computedProps.controlProps?.onKeyDown?.(event)

                switch (event.key) {
                    case KeyboardKey.ArrowDown: {
                        event.preventDefault()
                        event.stopPropagation()

                        state.setOpen(true)
                        state.setOptionFocused(state.optionTabbed ?? 0) // We move focus to last tabbed/focused option.
                        state.setOptionTabbed(state.optionTabbed ?? 0)
                    } break
                    case KeyboardKey.Enter:
                    case KeyboardKey.Space:
                        event.preventDefault()
                        event.stopPropagation()

                        state.setOpen(! state.open)
                    break
                    case KeyboardKey.Escape:
                        event.preventDefault()
                        event.stopPropagation()

                        state.setOpen(false)
                    break
                }
            }, [
                state.disabled,
                state.readonly,
                state.open,
                state.optionTabbed,
                state.setOpen,
                state.setOptionFocused,
                state.setOptionTabbed,
                computedProps.controlProps?.onKeyDown,
            ]),
        },

        optionsRootProps: {
            ...computedProps.optionsRootProps,
            className: classes(computedProps.optionsRootProps?.className),
            ref: useCallback((element: null | HTMLElement) => {
                refs.optionsRootRef.current = element ?? undefined
                // mapSome(computedProps.optionsRootProps?.ref, ref => setRef<null | HTMLElement>(ref, element)) // FIXME on React 19.
            }, [/* computedProps.optionsRootProps?.ref */]),
            ['aria-hidden']: ! state.open,
            style: {
                ...call((): undefined | React.CSSProperties => {
                    if (state.teleport) {
                        return
                    }
                    if (! state.open) {
                        return {
                            display: 'var(--Select-options-display--hidden, var(--Select-options-display--hidden--default, none))',
                        }
                    }

                    switch (state.placement) {
                        case 'top': return {
                            position: 'var(--Select-options-position, var(--Select-options-position--default, absolute))' as React.CSSProperties['position'],
                            zIndex: 'var(--Select-options-zindex, var(--Select-options-zindex--default, 1))',
                            top: 'calc(-1 * var(--Select-options-gap, var(--Select-options-gap--default, 0px)))',
                            left: 0,
                            right: 0,
                            width: '100%',
                            height: 0,
                            margin: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }
                        case 'center': return {
                            position: 'var(--Select-options-position, var(--Select-options-position--default, absolute))' as React.CSSProperties['position'],
                            zIndex: 'var(--Select-options-zindex, var(--Select-options-zindex--default, 1))',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }
                        case 'bottom': return {
                            position: 'var(--Select-options-position, var(--Select-options-position--default, absolute))' as React.CSSProperties['position'],
                            zIndex: 'var(--Select-options-zindex, var(--Select-options-zindex--default, 1))',
                            left: 0,
                            right: 0,
                            bottom: 'calc(-1 * var(--Select-options-gap, var(--Select-options-gap--default, 0px)))',
                            width: '100%',
                            height: 0,
                            margin: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                        }
                        case 'positioned': return {
                            position: 'var(--Select-options-position, var(--Select-options-position--default, absolute))' as React.CSSProperties['position'],
                            zIndex: 'var(--Select-options-zindex, var(--Select-options-zindex--default, 1))',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            margin: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }
                    }
                }),
                ...computedProps.optionsRootProps?.style,
            },
        },

        optionsListProps: {
            ...computedProps.optionsListProps,
            className: classes(computedProps.optionsListProps?.className),
            ref: useCallback((element: null | HTMLElement) => {
                refs.optionsListRef.current = element ?? undefined
                // mapSome(computedProps.optionsListProps?.ref, ref => setRef<null | HTMLElement>(ref, element)) // FIXME on React 19.
            }, [/* computedProps.optionsListProps?.ref */]),
            role: 'list',
        },

        optionPropsFor: (option: I, optionIdx: number) => ({
            ...computedProps.optionProps,
            ref(element: null | HTMLElement) {
                refs.optionsRef.current[optionIdx] = element ?? undefined
                // mapSome(computedProps.optionProps?.ref, ref => setRef<null | HTMLElement>(ref, element)) // FIXME on React 19.
            },
            className: classes(),
            role: 'listitem',
            ['aria-disabled']: option.disabled ?? false,
            ['aria-selected']:
                isArray(state.selected)
                    ? state.selected.some(it => it.value === option.value)
                    : (option.value === state.selected?.value)
            ,
            tabIndex: optionIdx === state.optionTabbed ? 0 : -1,
            onClick(event: React.MouseEvent<HTMLElement>) {
                if (state.disabled) {
                    return
                }
                if (state.readonly) {
                    return
                }
                if (option.disabled) {
                    return
                }

                computedProps.optionProps?.onClick?.(event)
                onOptionSelection(option, optionIdx, event)
            },
            onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
                if (state.disabled) {
                    return
                }
                /*
                * // Readonly select can be navigated and closed.
                * if (state.readonly) {
                *   return
                * }
                */

                computedProps.optionProps?.onKeyDown?.(event)

                switch (event.key) {
                    case KeyboardKey.ArrowUp: {
                        event.preventDefault()

                        const prevOptionIdx = optionIdx - 1
                        const prevOptionElement = refs.optionsRef.current[prevOptionIdx]

                        if (! prevOptionElement) {
                            return
                        }

                        state.setOptionFocused(prevOptionIdx)
                        state.setOptionTabbed(prevOptionIdx)
                    } break
                    case KeyboardKey.ArrowDown: {
                        event.preventDefault()

                        const optionIdx = refs.optionsRef.current.indexOf(event.currentTarget)

                        if (optionIdx === -1) {
                            return
                        }

                        const nextOptionIdx = optionIdx + 1
                        const nextOptionElement = refs.optionsRef.current[nextOptionIdx]

                        if (! nextOptionElement) {
                            return
                        }

                        state.setOptionFocused(nextOptionIdx)
                        state.setOptionTabbed(nextOptionIdx)
                    } break
                    case KeyboardKey.Enter:
                    case KeyboardKey.Space: {
                        event.preventDefault()

                        if (state.readonly) {
                            return
                        }
                        if (option.disabled) {
                            return
                        }

                        onOptionSelection(option, optionIdx, event)
                    } break
                    case KeyboardKey.Escape:
                        event.preventDefault()
                        event.stopPropagation()

                        state.setOpen(false)

                        refs.controlRef.current?.focus() // We move back the focus to the control element.
                    break
                }
            },
        }),
    }

    useClickOutside(
        refs.rootRef as React.MutableRefObject<HTMLElement>, // FIXME
        useCallback(event => {
            if (event.target && ! document.documentElement.contains(event.target as Node)) {
                // A DOM Node has been removed from the DOM tree by React.
                // Not an actual click outside event.
                return
            }

            state.setOpen(false)
            // We reset focused and tabbed option when clicking outside.
            state.setOptionFocused(undefined)
            state.setOptionTabbed(undefined)
        }, [state.setOpen, state.setOptionFocused, state.setOptionTabbed]),
        {active: state.open},
    )

    useEffect(() => {
        if (state.open) {
            // On open we focus last tabbed element.
            state.setOptionFocused(state.optionTabbed)
        }
        else {
            // On close we reset the focused element.
            state.setOptionFocused(undefined)
        }
    }, [state.open, state.setOptionFocused])

    useEffect(() => {
        if (isUndefined(state.optionFocused)) {
            return
        }

        refs.optionsRef.current[state.optionFocused]?.focus()
    }, [state.optionFocused])

    useEffect(() => {
        refs.optionsRef.current = refs.optionsRef.current.slice(0, args.options?.length ?? 0)
    }, [args.options?.length])

    useLayoutEffect(() => {
        if (state.placement !== 'positioned') {
            return
        }
        if (state.teleport) {
            return
        }
        if (! args.options) {
            return
        }
        if (! state.open) {
            ElementTranslate.clean(refs.optionsRootRef.current)
            return
        }
        if (! state.selected) {
            ElementTranslate.clean(refs.optionsRootRef.current)
            return
        }
        if (isArray(state.selected)) {
            return
        }

        const selected = state.selected as I
        const optionIdx = args.options.findIndex(it => it.value === selected.value)
        const controlElement = refs.controlRef.current
        const optionsRootElement = refs.optionsRootRef.current
        const optionsListElement = refs.optionsListRef.current
        const optionElement = refs.optionsRef.current[optionIdx]

        if (optionIdx < 0) {
            return
        }
        if (! controlElement) {
            return
        }
        if (! optionsRootElement) {
            return
        }
        if (! optionsListElement) {
            return
        }
        if (! optionElement) {
            return
        }

        const hasScrolling = (optionsListElement.scrollHeight - optionsListElement.clientHeight)

        if (hasScrolling) {
            const scrollHeight = optionsListElement.scrollHeight
            const optionsListElementRect = optionsListElement.getBoundingClientRect()
            const optionElementRect = optionElement.getBoundingClientRect()
            const optionElementOffsetY = optionElement.offsetTop

            const optionElementScrollY = (
                optionElementOffsetY
                - (optionsListElementRect.height / 2) // Centered inside the options list.
                + (optionElementRect.height / 2) // Centered inside the options list.
            )

            optionsListElement.scrollTop = clamp(0, optionElementScrollY, scrollHeight)
            return
        }

        const [currentXOptional, currentYOptional] = ElementTranslate.read(refs.optionsRootRef.current)
        const currentY = currentYOptional ?? 0

        const optionElementRect = optionElement.getBoundingClientRect()
        const controlElementRect = controlElement.getBoundingClientRect()

        const heightDelta = controlElementRect.height - optionElementRect.height
        const yDelta = controlElementRect.y - optionElementRect.y
        const transformY = currentY + yDelta + (heightDelta / 2)

        ElementTranslate.write(refs.optionsRootRef.current, 0, transformY)
    }, [state.placement, state.teleport, state.open, state.selected, args.options])

    return {props, refs, state}
}

const ElementTranslate = {
    read(element: undefined | null | HTMLElement): Array<number> {
        return element?.style.translate
            .split(' ')
            .filter(Boolean)
            .map(it => it.replace('px', ''))
            .map(Number)
            ?? []
    },
    write(element: undefined | null | HTMLElement, xPx: number, yPx: number) {
        if (! element) {
            return
        }
        element.style.translate = `${xPx}px ${yPx}px`
    },
    clean(element: undefined | null | HTMLElement) {
        if (! element) {
            return
        }

        element.style.translate = ''
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export type SelectContextValueGeneric = SelectContextValue<
    SelectOptionGeneric<any>,
    undefined | SelectOptionGeneric<any> | Array<SelectOptionGeneric<any>>
>

export interface SelectContextValue<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>> {
    props: {
        rootProps: React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement> & {
            ref: React.RefCallback<null | HTMLElement>
            className: undefined | string
            'aria-controls': string
            'aria-disabled': boolean
            'aria-expanded': boolean
            'data-placement': string
            style: React.CSSProperties
            onBlur(event: React.FocusEvent<HTMLElement>): void
        }
        controlProps: React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement> & {
            ref: React.RefCallback<null | HTMLElement>
            className: undefined | string
            role: AriaRole
            'aria-invalid': boolean
            'aria-readonly': boolean
            'aria-required': boolean
            tabIndex: number
            onClick(event: React.MouseEvent<HTMLElement>): void
            onFocus(event: React.FocusEvent<HTMLElement>): void
            onKeyDown(event: React.KeyboardEvent<HTMLElement>): void
        }
        optionsRootProps: React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement> & {
            ref: React.RefCallback<null | HTMLElement>
            className: undefined | string
            'aria-hidden': boolean
            style: React.CSSProperties
        }
        optionsListProps: React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement> & {
            ref: React.RefCallback<null | HTMLElement>
            className: undefined | string
            role: AriaRole
        }
        optionPropsFor(option: I, optionIdx: number): React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement> & {
            ref(element: null | HTMLElement): void
            className: undefined | string
            role: AriaRole
            'aria-disabled': boolean
            'aria-selected': boolean
            tabIndex: number
            onClick(event: React.MouseEvent<HTMLElement>): void
            onKeyDown(event: React.KeyboardEvent<HTMLElement>): void
        }
    }
    refs: {
        rootRef: React.MutableRefObject<undefined | HTMLElement>
        controlRef: React.MutableRefObject<undefined | HTMLElement>
        optionsRef: React.MutableRefObject<Array<undefined | HTMLElement>>
    }
    state: {
        disabled: boolean
        mounted: boolean
        open: boolean
        optionFocused: undefined | number
        optionTabbed: undefined | number
        placement: SelectPlacement
        readonly: boolean
        required: boolean
        selected: S
        teleport: boolean
        valid: boolean
        clearSelected(): void
        setOpen(open: boolean): void
        setOptionFocused(optionIdx: undefined | number): void
        setOptionTabbed(optionIdx: undefined | number): void
        setSelected(selected: S): void
    }
}

export interface SelectProviderOptions<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>> {
    disabled: undefined | boolean
    mounted: undefined | boolean
    open: boolean
    options: undefined | Array<I>
    placement: undefined | SelectPlacement
    readonly: undefined | boolean
    required: undefined | boolean
    selected: S
    teleport: undefined | boolean
    valid: undefined | boolean
    clearSelected(): void
    onOptionSelection(option: I, optionIdx: number, event: React.UIEvent<HTMLElement>): void
    setOpen(open: boolean): void
    setSelected(selected: S): void
    rootProps?: undefined | Computable<undefined | (React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>), [SelectComputablePropsContext<S>]>
    controlProps?: undefined | Computable<undefined | (React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>), [SelectComputablePropsContext<S>]>
    optionsRootProps?: undefined | Computable<undefined | (React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>), [SelectComputablePropsContext<S>]>
    optionsListProps?: undefined | Computable<undefined | (React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>), [SelectComputablePropsContext<S>]>
    optionProps?: undefined | Computable<undefined | (React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>), [SelectComputablePropsContext<S>]>
}

type SelectProviderFactoryOverriddenOptionsKey = 'open' | 'selected' | 'clearSelected' | 'onOptionSelection' | 'setOpen'

export type SelectProviderFactoryOptions<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>> =
    & Omit<SelectProviderOptions<I, S>, SelectProviderFactoryOverriddenOptionsKey>
    & ObjectPartial<Pick<SelectProviderOptions<I, S>, SelectProviderFactoryOverriddenOptionsKey>>
    & {
    initialOpen: undefined | boolean
    initialSelected: undefined | S
}

export type SelectOneProviderOptions<I extends SelectOptionGeneric<any>> = SelectProviderFactoryOptions<I, undefined | I>
export type SelectManyProviderOptions<I extends SelectOptionGeneric<any>> = SelectProviderFactoryOptions<I, Array<I>>

export interface SelectComputablePropsContext<S extends undefined | SelectOptionGeneric<any> | Array<SelectOptionGeneric<any>>> {
    open: boolean
    selected: S
}
