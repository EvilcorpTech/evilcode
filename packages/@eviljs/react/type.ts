// Types ///////////////////////////////////////////////////////////////////////

export type VoidProps<P extends object> = Omit<P, 'children'>

export interface ValueMutator<V, C = V, R = void> {
    value: V
    onChange: (value: C) => R
}

export interface ItemSelector<I, V, C = V, R = void> {
    items: Array<I>
    selected: V
    onSelect: (value: C, idx: number) => R
}
