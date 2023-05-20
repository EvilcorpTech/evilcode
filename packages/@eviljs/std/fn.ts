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

export type FnArgs = Array<unknown>

export type Task<R = void> = () => R
export type TaskVoid = () => void
export type AsyncTask<R = void> = Task<Promise<R>>

export type Fn<A extends FnArgs, R = void> = (...args: A) => R
export type Io<I = unknown, O = unknown> = (input: I) => O
export type AsyncIo<I, O> = Io<I, Promise<O>>

export type ValueComputable<T, A extends FnArgs = []> = T | Fn<A, T>
