import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import {useId} from 'react'

export function RadioGroup(props: Props<RadioGroupProps>): React.JSX.Element {
    const {className, items, selected, onChange, ...otherProps} = props
    const id = useId()

    return (
        <div
            {...otherProps}
            className={classes('RadioGroup-e37b', className)}
        >
            {items?.map((it, idx) =>
                <label
                    key={idx}
                    className="item-bf74 std-flex std-flex-align-center"
                    data-selected={selected === it.value}
                >
                    <input
                        {...it.inputsProps}
                        className={classes('radio-1370', it.inputsProps?.className)}
                        type="radio"
                        name={`radio-group-${id}`}
                        value={it.value}
                        checked={selected === it.value}
                        // readOnly={true}
                        onChange={(event) => onChange?.(event.target.value, idx)}
                    />
                    <span className="label-b0ad">
                        {it.label}
                    </span>
                </label>
            )}
        </div>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RadioGroupProps extends Omit<ElementProps<'div'>, 'onChange'> {
    selected?: undefined | null | string
    items?: undefined | null | Array<{
        value: string
        label: React.ReactNode
        inputsProps?: undefined | ElementProps<'input'>
    }>
    onChange?: undefined | ((value: string, idx: number) => void)
}
