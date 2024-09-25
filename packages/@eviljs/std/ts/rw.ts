// We opted out from using a `.value` getter+setter,
// because getter and setters can not be spread using the spread operator (...)
// and Object.assign() but requires a special extend utility.
// It would be an easy trap for the API consumer, who could do
// {...accessor} or
// {value, read, write} = accessor
// with consequent loss of reactivity and bugs.
export function createReadWrite<V>(read: () => Promise<V>, write: (value: V) => Promise<V>): RwAsync<V>
export function createReadWrite<V>(read: () => V, write: (value: V) => V): RwSync<V>
export function createReadWrite<V>(read: () => V, write: (value: V) => V): RwSync<V> | RwAsync<V> {
    return {read, write}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RwSync<V> {
    read(): V
    write(value: V): V
}

export interface RwAsync<V> {
    read(): Promise<V>
    write(value: V): Promise<V>
}
