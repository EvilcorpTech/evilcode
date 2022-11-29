export const Tests = {
    array: isArray,
    boolean: isBoolean,
    date: isDate,
    defined: isDefined,
    function: isFunction,
    integer: isInteger,
    nil: isNil,
    notNil: isNotNil,
    null: isNull,
    number: isNumber,
    object: isObject,
    promise: isPromise,
    regexp: isRegExp,
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

export function isDefined<T>(value: void | undefined | T): value is T {
    return ! isUndefined(value)
}

export function isUndefined(value: unknown): value is undefined {
    return value === void undefined
}

export function isNil(value: unknown): value is Nil {
    return isUndefined(value) || isNull(value)
}

export function isNotNil<I>(item: Nil | I): item is I {
    return ! isNil(item)
}

export function isNull(value: unknown): value is null {
    return value === null
}

export function isFunction<O, A extends Array<unknown>, R>(value: O | ((...args: A) => R)): value is ((...args: A) => R)
export function isFunction(value: unknown): value is Function {
    if (! value || typeof value !== 'function') {
        return false
    }
    return true
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && ! isNaN(value)
    // We don't consider NaN a number.
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
}

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

export function asNumber(value: number): number
export function asNumber(value: unknown): undefined | number
export function asNumber(value: unknown): undefined | number {
    if (! isNumber(value)) {
        // null and arrays are parsed by Number as 0.
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
    const numberMaybe = asNumber(value)

    if (isNil(numberMaybe)) {
        return
    }

    return Math.trunc(numberMaybe)
}

export function asDate(value: unknown): undefined | Date {
    // Date.parse() is omnivorous, accepts everything. Everything not string is returned as NaN.
    const result = Date.parse(value as string)

    if (isNaN(result)) {
        return
    }

    return new Date(result)
}

// Types ///////////////////////////////////////////////////////////////////////

export type Nil = undefined | null

export type Partial<T> = {
    [K in keyof T]?: undefined | T[K]
}

export type PartialDeep<T> = {
    [P in keyof T]?: undefined | PartialDeep<T[P]>
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
