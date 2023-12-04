import type {Fn, FnArgs, Task} from './fn.js'
import {isArray, isFunction, isObject, isString} from './type.js'

export function asSafeType(type: ArrayConstructor, value: unknown): Array<unknown>
export function asSafeType(type: FunctionConstructor, value: unknown): Task<unknown>
export function asSafeType(type: ObjectConstructor, value: unknown): Record<PropertyKey, unknown>
export function asSafeType(type: StringConstructor, value: unknown): string
export function asSafeType(
    type:
        | ArrayConstructor
        | FunctionConstructor
        | ObjectConstructor
        | StringConstructor
    ,
    value: unknown,
) {
    switch (type) {
        case Array: return asSafeArray(value)
        case Function: return asSafeFunction(value)
        case Object: return asSafeObject(value)
        case String: return asSafeString(value)
    }
    return // Makes TypeScript happy.
}

export function asSafeString<T extends string>(value: T): T
export function asSafeString(value: unknown): string
export function asSafeString(value: unknown): string {
    return isString(value) ? value : ''
}

export function asSafeArray<T extends Array<any>>(value: T): T
export function asSafeArray(value: unknown): Array<unknown>
export function asSafeArray(value: unknown): Array<unknown> {
    return isArray(value) ? value : []
}

export function asSafeObject<T extends Record<PropertyKey, any>>(value: T): T
export function asSafeObject(value: unknown): Record<PropertyKey, unknown>
export function asSafeObject(value: unknown): Record<PropertyKey, unknown> {
    return isObject(value)
        ? value
        : {}
}

export function asSafeFunction(value: unknown): undefined | Task<unknown> {
    return isFunction(value)
        ? value
        : undefined
}

export function asSafeCall<A extends FnArgs, R>(value: undefined | Fn<A, R>, ...args: A): undefined | R {
    return isFunction(value)
        ? value(...args)
        : undefined
}
