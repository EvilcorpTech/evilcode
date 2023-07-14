export function createRef<V>(): Ref<undefined | V>
export function createRef<V>(value: V): Ref<V>
export function createRef<V>(value?: undefined | V): Ref<undefined | V> {
    return {value}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Ref<V> {
    value: V
}
