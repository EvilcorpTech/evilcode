export const Tests = {
    array: isArray,
    boolean: isBoolean,
    date: isDate,
    defined: isDefined,
    function: isFunction,
    integer: isInteger,
    nil: isNil,
    null: isNull,
    number: isNumber,
    object: isObject,
    promise: isPromise,
    regexp: isRegExp,
    some: isSome,
    string: isString,
    undefined: isUndefined,
}

export function kindOf<T extends keyof typeof Tests>(value: unknown, ...tests: Array<T>): undefined | T {
    for (const kind of tests) {
        const test = Tests[kind] as ((value: unknown) => boolean)

        if (test(value)) {
            return kind
        }
    }
    return
}

// Tests ///////////////////////////////////////////////////////////////////////

export function isDefined<T>(value: void | undefined | T): value is T {
    return ! isUndefined(value)
}

export function isNil(value: unknown): value is Nil {
    return isUndefined(value) || isNull(value)
}

export function isNull(value: unknown): value is null {
    return value === null
}

export function isSome<I>(item: Nil | I): item is I {
    return ! isNil(item)
}

export function isUndefined(value: unknown): value is undefined {
    return value === void undefined
}

export function isArray(value: unknown): value is Array<unknown> {
    if (! value) {
        return false
    }
    if (! Array.isArray(value)) {
        return false
    }
    return true
}

export function isBoolean(value: unknown): value is boolean {
    return value === true || value === false
    // return typeof value !== "boolean"
}

export function isDate(value: unknown): value is Date {
    return value
        ? (value instanceof Date)
        : false
}

export function isFunction<O, A extends Array<unknown>, R>(value: O | ((...args: A) => R)): value is ((...args: A) => R)
export function isFunction(value: unknown): value is Function {
    if (! value) {
        return false
    }
    if (typeof value !== 'function') {
        return false
    }
    return true
}

export function isNumber(value: unknown): value is number {
    // We don't consider NaN a number.
    return typeof value === 'number' && ! isNaN(value)
}

export function isInteger(value: unknown): value is number {
    return Number.isInteger(value as any)
}

export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    if (! value) {
        return false
    }

    const proto = Object.getPrototypeOf(value)

    if (! proto) {
        // FIXME: TODO: how to handle Object.create(null)?
        return false
    }
    if (proto.constructor !== Object) {
        return false
    }
    return true
}

export function isPromise(value: unknown): value is Promise<unknown> {
    return value
        ? (value instanceof Promise)
        : false
}

export function isRegExp(value: unknown): value is RegExp {
    return value
        ? (value instanceof RegExp)
        : false
}

export function isString(value: unknown): value is string {
    return typeof value === 'string'
}

// Casts ///////////////////////////////////////////////////////////////////////

export function asArray<T>(item: T | Array<T> | [T] | readonly [T]): Array<T> {
    return isArray(item)
        ? item
        : [item] as Array<T>
}

export function asBoolean(value: unknown): undefined | boolean {
    return isBoolean(value)
        ? value
        : undefined
}

export function asBooleanLike(value: unknown): undefined | boolean {
    switch (value) {
        case true: case 1: case '1': case 'yes': case 'on': case 'true':
            return true
        case false: case 0: case '0': case 'no': case 'off': case 'false':
            return false
    }
    return
}

export function asDate(value: unknown): undefined | Date {
    if (! value) {
        return
    }
    if (isDate(value)) {
        return value
    }
    if (isNumber(value)) {
        return new Date(value)
    }
    if (! isString(value)) {
        return
    }

    // Date.parse() is omnivorous:
    // it accepts everything, and everything not string is returned as NaN.
    return asDate(Date.parse(value))
}

export function asNumber(value: number): number
export function asNumber(value: unknown): undefined | number
export function asNumber(value: unknown): undefined | number {
    if (isNumber(value)) {
        return value
    }
    if (! isString(value)) {
        // Only strings should be parsed:
        // - null and Arrays would be parsed as 0
        // - Symbols would throws an error
        return
    }

    const result = Number(value)

    if (isNaN(result)) {
        return
    }
    return result
}


export function asInteger(value: number): number
export function asInteger(value: unknown): undefined | number
export function asInteger(value: unknown): undefined | number {
    const numberOptional = asNumber(value)

    if (isUndefined(numberOptional)) {
        return
    }

    return Math.trunc(numberOptional)
}

// Types ///////////////////////////////////////////////////////////////////////

export type Nil = undefined | null
export type Some<T> = NonNullable<T>

export type Partial<T> = {
    [K in keyof T]?: undefined | T[K]
}

export type PartialDeep<T> = {
    [K in keyof T]?: undefined | (T[K] extends object ? PartialDeep<T[K]> : T[K])
}

export type Required<T> = {
    [P in keyof T]-?: Exclude<T[P], undefined>
}

export type Nullish<T> =
    T extends Nil | boolean | number | string | symbol
        ? Nil | T
    : T extends Array<infer I>
        ? Nil | Array<Nullish<I>>
    : T extends object
        ? Nil | {[key in keyof T]?: Nil | Nullish<T[key]>}
    : unknown

export type ValueOf<T> = T[keyof T]

export type ElementOf<A extends Array<unknown>> =
    A extends Array<infer T>
        ? T
        : never

export type UnionOf<T extends Array<unknown>> = T[number]
