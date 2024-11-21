// Types ///////////////////////////////////////////////////////////////////////

export interface SelectOptionGeneric<V> {
    disabled?: undefined | boolean
    label?: undefined | React.ReactNode
    value: V
}

export type SelectPlacement = 'top' | 'center' | 'bottom' | 'positioned'
