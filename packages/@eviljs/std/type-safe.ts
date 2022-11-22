import type {Fn} from './fn.js'
import {isArray, isFunction, isString} from './type.js'

export function safeType(type: StringConstructor, value: unknown): string
export function safeType(type: ArrayConstructor, value: unknown): Array<unknown>
export function safeType(type: ArrayConstructor | StringConstructor, value: unknown) {
    switch (type) {
        case String: return safeString(value)
        case Array: return safeArray(value)
    }
    return // Makes TypeScript happy.
}

export function safeString<T extends string>(value: T): T
export function safeString(value: unknown): unknown
export function safeString(value: unknown): string {
    return isString(value) ? value : ''
}

export function safeArray<T extends Array<unknown>>(value: T): T
export function safeArray(value: unknown): Array<unknown>
export function safeArray(value: unknown): Array<unknown> {
    return isArray(value) ? value : []
}

export function safeFunction<F extends Fn<Array<any>, any>>(value: undefined | F): undefined | F {
    return isFunction(value)
        ? value
        : undefined
}

export function safeCall<A extends Array<unknown>, R>(value: undefined | Fn<A, R>, ...args: A): undefined | R {
    return isFunction(value)
        ? value(...args)
        : undefined
}
