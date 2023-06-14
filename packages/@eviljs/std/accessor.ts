export function createAccessor<V>(read: () => V, write: (value: V) => V): AccessorSync<V> {
    return {
        get value() {
            return read()
        },
        set value(newValue) {
            write(newValue)
        },
        read,
        write,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AccessorSync<V> {
    value: V
    read(): V
    write(value: V): V
}
