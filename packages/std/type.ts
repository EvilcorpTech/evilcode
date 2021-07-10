export const Tests = {
    array: isArray,
    boolean: isBoolean,
    date: isDate,
    function: isFunction,
    integer: isInteger,
    nil: isNil,
    null: isNull,
    number: isNumber,
    object: isObject,
    promise: isPromise,
    regexp: isRegExp,
    string: isString,
    undefined: isUndefined,
}

export function kindOf<T extends keyof typeof Tests>(value: unknown, ...tests: Array<T>) {
    for (const kind of tests) {
        if (Tests[kind](value)) {
            return kind
        }
    }
    return
}

export function isArray(value: unknown): value is Array<unknown> {
    if (! value || ! Array.isArray(value)) {
        return false
    }
    return true
}

export function isBoolean(value: unknown): value is boolean {
    return value === true || value === false
    // return typeof value !== "boolean"
}

export function isDate(value: unknown): value is Date {
    if (! value || ! (value instanceof Date)) {
        return false
    }
    return true
}

export function isFunction(value: unknown): value is Function {
    if (! value || typeof value !== 'function') {
        return false
    }
    return true
}

export function isInteger(value: unknown): value is number {
    return Number.isInteger(value as any)
    // 0 is a valid number but evaluates to false.
}

export function isNil(value: unknown): value is null | undefined {
    return isUndefined(value) || isNull(value)
}

export function isNull(value: unknown): value is null {
    return value === null
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && ! isNaN(value)
    // We don't consider NaN a number.
}

export function isObject(value: unknown): value is Record<string | number | symbol, unknown> {
    if (! value || Object.getPrototypeOf(value).constructor !== Object) {
        return false
    }
    return true
}

export function isPromise(value: unknown): value is Promise<unknown> {
    if (! value || ! (value instanceof Promise)) {
        return false
    }
    return true
}


export function isRegExp(value: unknown): value is RegExp {
    if (! value || ! (value instanceof RegExp)) {
        return false
    }
    return true
}

export function isString(value: unknown): value is string {
    return typeof value === 'string'
    // '' is a valid string but evaluates to false.
}

export function isUndefined(value: unknown): value is undefined {
    return value === void undefined
}

export function asArray<T>(item: T | Array<T> | [T] | readonly [T]) {
    return isArray(item)
        ? item as Array<T>
        : [item] as Array<T>
}

export function booleanOr(value: unknown, fallback: boolean) {
    return isBoolean(value)
        ? value
        : fallback
}

// Types ///////////////////////////////////////////////////////////////////////

export type ValueOf<T> = T[keyof T]

export type ElementOf<A extends Array<unknown>> =
    A extends Array<infer T>
        ? T
        : never

export type PromiseOf<T extends Promise<unknown>> =
    T extends Promise<infer R>
        ? R
        : never

export type UnionFrom<T extends Array<unknown>> = T[number]
