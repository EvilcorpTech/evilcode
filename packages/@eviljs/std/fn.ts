import {isFunction} from './type.js'

export {compose} from './compose.js'
export {pipe} from './pipe.js'
export * from './return.js'
export {returnInput as identity} from './return.js'

export function computeValue<T, A extends Array<unknown>>(value: ValueComputable<T, A>, ...args: A) {
    return isFunction(value)
        ? value(...args)
        : value
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Fn<A extends FnArgs, R> {
    (...args: A): R
}

export type FnArgs = Array<unknown>

export interface Io<I = unknown, O = unknown> {
    (input: I): O
}

export interface AsyncIo<I, O> {
    (input: I): Promise<O>
}

export type ValueComputable<T, A extends FnArgs = []> = T | Fn<A, T>
