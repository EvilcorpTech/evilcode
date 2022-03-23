export const NoItems: [] = []

// Types ///////////////////////////////////////////////////////////////////////

export interface ValueMutator<V, C = V> {
    value: V
    onChange: (value: C) => void
}

export interface ItemSelector<I, V, C = V> {
    items: Array<I>
    selected: V
    onSelect: (value: C, idx: number) => void
}
