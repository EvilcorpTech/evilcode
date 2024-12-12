import {classes} from '@eviljs/react/classes'
import type {Props, VoidProps} from '@eviljs/react/props'
import type {Io} from '@eviljs/std/fn-type'
import {isArray} from '@eviljs/std/type-is'
import type {Prettify} from '@eviljs/std/type-types'
import {useImperativeHandle} from 'react'
import {createPortal} from 'react-dom'
import type {SelectOptionGeneric, SelectPlacement} from './select.api.js'
import {
    SelectContext,
    useSelectManyProvider,
    useSelectOneProvider,
    type SelectContextValue,
    type SelectContextValueGeneric,
    type SelectProviderOptions,
} from './select.hook.js'

export * from './select.api.js'

export function Select<
    I extends SelectOptionGeneric<any>,
    S extends undefined | I | Array<I>,
>(props: Props<SelectProps<I, S>>): React.JSX.Element {
    const {
        className,
        context,
        ref,
        options,
        control: renderControlOptional,
        option: renderOptionOptional,
        portal: renderPortalOptional,
        components,
    } = props

    useImperativeHandle(ref, () => context, [context])

    function renderControl(props: SelectControlProps<I, S>) {
        if (renderControlOptional) {
            return renderControlOptional(props)
        }
        if (components?.Control) {
            return <components.Control {...props}/>
        }
        if (! props.selected) {
            return
        }
        if (isArray(props.selected)) {
            return
        }
        return props.selected.label ?? String(props.selected.value)
    }

    function renderOption(props: SelectOptionProps<I, S>) {
        if (renderOptionOptional) {
            return renderOptionOptional(props)
        }
        if (components?.Option) {
            return <components.Option {...props}/>
        }
        return props.option.label ?? String(props.option.value)
    }

    function renderPortal(props: SelectPortalProps) {
        if (renderPortalOptional === true) {
            return createPortal(props.children, document.body)
        }
        if (renderPortalOptional) {
            return renderPortalOptional(props)
        }
        if (components?.Portal) {
            return <components.Portal {...props}/>
        }
        return props.children
    }

    return (
        <SelectContext.Provider value={context}>
            <div
                {...context.props.rootProps}
                className={classes('Select-b791', className, context.props.rootProps.className)}
            >
                <div
                    {...context.props.controlProps}
                    className={classes('control-slot-cf42', context.props.controlProps.className)}
                >
                    {renderControl({
                        disabled: context.state.disabled,
                        mounted: context.state.mounted,
                        readonly: context.state.readonly,
                        required: context.state.required,
                        valid: context.state.valid,
                        open: context.state.open,
                        selected: context.state.selected,
                        onClick: context.props.controlProps.onClick,
                        onSelected: context.state.setSelected,
                        onClearSelected: context.state.clearSelected,
                    })}
                </div>

                {(context.state.mounted || context.state.open) &&
                    renderPortal({
                        open: context.state.open,
                        refs: context.refs,
                        children:
                            <div
                                {...context.props.optionsRootProps}
                                className={classes('options-root-831a', context.props.optionsRootProps.className)}
                            >
                                <div
                                    {...context.props.optionsListProps}
                                    className={classes('options-list-bfc5', context.props.optionsListProps.className)}
                                >
                                    {options?.map((option, optionIdx) => {
                                        const optionProps = context.props.optionPropsFor(option, optionIdx)

                                        return (
                                            <div
                                                {...optionProps}
                                                key={optionIdx}
                                                className={classes('option-slot-0fe7', optionProps.className)}
                                            >
                                                {renderOption({
                                                    disabled: context.state.disabled,
                                                    mounted: context.state.mounted,
                                                    readonly: context.state.readonly,
                                                    required: context.state.required,
                                                    valid: context.state.valid,
                                                    option: option,
                                                    optionIdx: optionIdx,
                                                    selected: context.state.selected,
                                                    onClick: optionProps.onClick,
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ,
                    })
                }
            </div>
        </SelectContext.Provider>
    )
}

export function SelectOne<I extends SelectOptionGeneric<any>>(props: Props<SelectOneProps<I>>): React.JSX.Element {
    const {
        className,
        ref,

        disabled,
        mounted,
        placement,
        readonly,
        required,
        valid,

        initialOpen,
        open: openControlled,
        onOpenChange: setOpenControlled,

        options,
        initialSelected,
        selected: selectedControlled,
        onSelectedChange: setSelectedControlled,

        controlProps,
        optionsRootProps,
        optionsListProps,
        optionProps,

        control: renderControl,
        option: renderOption,
        portal: renderPortal,
        components,
        ...rootProps
    } = props

    const context = useSelectOneProvider({
        disabled: disabled,
        initialOpen: initialOpen,
        initialSelected: initialSelected,
        mounted: mounted,
        open: openControlled,
        options: options,
        placement: placement,
        readonly: readonly,
        required: required,
        selected: selectedControlled,
        setOpen: setOpenControlled,
        setSelected: setSelectedControlled,
        teleport: Boolean(renderPortal || components?.Portal),
        valid: valid,
        rootProps: rootProps,
        controlProps: controlProps,
        optionsRootProps: optionsRootProps,
        optionsListProps: optionsListProps,
        optionProps: optionProps,
    })

    return (
        <Select
            ref={ref}
            className={classes('SelectOne-b79c', className)}
            context={context}
            options={options}
            control={renderControl}
            option={renderOption}
            portal={renderPortal}
            components={components}
        />
    )
}

export function SelectMany<I extends SelectOptionGeneric<any>>(props: Props<SelectManyProps<I>>): React.JSX.Element {
    const {
        className,
        ref,

        disabled,
        mounted,
        placement,
        readonly,
        required,
        valid,

        initialOpen,
        open: openControlled,
        onOpenChange: setOpenControlled,

        options,
        initialSelected,
        selected: selectedControlled,
        onSelectedChange: setSelectedControlled,

        controlProps,
        optionsRootProps,
        optionsListProps,
        optionProps,

        control: renderControl,
        option: renderOption,
        portal: renderPortal,
        components,
        ...rootProps
    } = props

    const context = useSelectManyProvider({
        disabled: disabled,
        initialOpen: initialOpen,
        initialSelected: initialSelected,
        mounted: mounted,
        open: openControlled,
        options: options,
        placement: placement,
        readonly: readonly,
        required: required,
        selected: selectedControlled,
        setOpen: setOpenControlled,
        setSelected: setSelectedControlled,
        teleport: Boolean(renderPortal || components?.Portal),
        valid: valid,
        rootProps: rootProps,
        controlProps: controlProps,
        optionsRootProps: optionsRootProps,
        optionsListProps: optionsListProps,
        optionProps: optionProps,
    })

    return (
        <Select
            ref={ref}
            className={classes('SelectMany-4d4c', className)}
            context={context}
            options={options}
            control={renderControl}
            option={renderOption}
            portal={renderPortal}
            components={components}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SelectGenericProps<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>> extends
    Prettify<
        & Omit<VoidProps<React.JSX.IntrinsicElements['div']>, 'ref' | 'onSelectedChange'>
        & React.RefAttributes<SelectContextValue<I, S>>
    >
{
    disabled?: undefined | boolean
    mounted?: undefined | boolean
    placement?: undefined | SelectPlacement
    readonly?: undefined | boolean
    required?: undefined | boolean
    valid?: undefined | boolean

    initialOpen?: undefined | boolean
    open?: undefined | boolean
    onOpenChange?: undefined | ((value: boolean) => void)

    options: undefined | Array<I>
    initialSelected?: undefined | S
    selected?: undefined | S
    onSelectedChange(option: S): void

    controlProps?: undefined | SelectProviderOptions<I, S>['controlProps']
    optionsRootProps?: undefined | SelectProviderOptions<I, S>['optionsRootProps']
    optionsListProps?: undefined | SelectProviderOptions<I, S>['optionsListProps']
    optionProps?: undefined | SelectProviderOptions<I, S>['optionProps']

    control?: undefined | Io<SelectControlProps<I, S>, React.ReactNode>
    option?: undefined | Io<SelectOptionProps<I, S>, React.ReactNode>
    portal?: undefined | boolean | Io<SelectPortalProps, React.ReactNode>
    components?: undefined | {
        Control?: undefined | React.ComponentType<SelectControlProps<I, S>>
        Option?: undefined | React.ComponentType<SelectOptionProps<I, S>>
        Portal?: undefined | React.ComponentType<SelectPortalProps>
    }
}

export interface SelectProps<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>> extends React.RefAttributes<SelectContextValue<I, S>> {
    className?: undefined | string
    context: SelectContextValue<I, S>
    options: SelectGenericProps<I, S>['options']
    control: SelectGenericProps<I, S>['control']
    option: SelectGenericProps<I, S>['option']
    portal: SelectGenericProps<I, S>['portal']
    components: SelectGenericProps<I, S>['components']
}

export interface SelectOneProps<I extends SelectOptionGeneric<any>> extends SelectGenericProps<I, undefined | I> {
}

export interface SelectManyProps<I extends SelectOptionGeneric<any>> extends SelectGenericProps<I, Array<I>> {
}

export interface SelectControlProps<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>> {
    disabled: boolean
    mounted: boolean
    readonly: boolean
    required: boolean
    valid: boolean
    open: boolean
    selected: S
    onClick(event: React.MouseEvent<HTMLElement>): void
    onClearSelected(): void
    onSelected(selected: S): void
}

export interface SelectOptionProps<I extends SelectOptionGeneric<any>, S extends undefined | I | Array<I>> {
    disabled: boolean
    mounted: boolean
    readonly: boolean
    required: boolean
    valid: boolean
    option: I
    optionIdx: number
    selected: S
    onClick(event: React.MouseEvent<HTMLElement>): void
}

export interface SelectPortalProps {
    children: React.ReactNode
    open: boolean
    refs: SelectContextValueGeneric['refs']
}
