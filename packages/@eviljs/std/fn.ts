import {isFunction} from './type.js'

export {returnInput as identity} from './return.js'

export function computeValue<T, A extends Array<unknown>>(value: ValueComputable<T, A>, ...args: A) {
    return isFunction(value)
        ? value(...args)
        : value
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Fn<A extends Array<unknown>, R> {
    (...args: A): R
}

export type ValueComputable<T, A extends Array<unknown> = []> = T | Fn<A, T>
