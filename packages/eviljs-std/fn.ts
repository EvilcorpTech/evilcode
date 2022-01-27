import {isFunction} from './type.js'

export function computeValue<T, A extends Array<unknown>>(
    value: ComputableValue<T, A>,
    ...args: A
) {
    return isFunction(value)
        ? value(...args)
        : value
}

// export function wrap<A extends Array<unknown>, R = unknown>(
//     fn: (...args: A) => R,
//     decorators: Array<Decorator>,
// ) {
//     const wrapped = decorators.reduce((fn, decorate) =>
//         decorate(fn)
//     , fn)
//
//     return wrapped as Fn<A, R>
// }

// Types ///////////////////////////////////////////////////////////////////////

export type ComputableValue<T, A extends Array<unknown> = []> = T | ((...args: A) => T)

export interface Fn<A extends Array<unknown>, R> {
    (...args: A): R
}

// export type Decorator = (fn: Fn) => Fn
