import type {Fn, FnArgs} from './fn.js'
import {isFunction} from './type.js'

export function compute<T, A extends Array<unknown>>(value: Computable<T, A>, ...args: A) {
    return isFunction(value)
        ? value(...args)
        : value
}

// Types ///////////////////////////////////////////////////////////////////////

export type Computable<T, A extends FnArgs = []> = T | Fn<A, T>
