import type {Fn, FnArgs} from './fn.js'
import {isFunction} from './type.js'

export function compute<T, A extends Array<unknown>>(value: ComputableValue<T, A>, ...args: A) {
    return isFunction(value)
        ? value(...args)
        : value
}

// Types ///////////////////////////////////////////////////////////////////////

export type ComputableValue<T, A extends FnArgs = []> = T | Fn<A, T>
