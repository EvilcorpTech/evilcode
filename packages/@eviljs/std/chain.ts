import type {Io} from './fn.js'

export function chain<V>(value: V, ...args: Array<Io<V, void>>): V {
    for (const arg of args) {
        arg(value)
    }

    return value
}
