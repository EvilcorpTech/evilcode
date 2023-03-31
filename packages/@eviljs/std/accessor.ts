export function createAccessor<T>(read: () => T, write: (value: T) => T): AccessorSync<T> {
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

export interface AccessorSync<T> {
    value: T
    read(): T
    write(value: T): T
}
