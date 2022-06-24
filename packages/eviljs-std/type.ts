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

export function isDefined<T>(value: undefined | T): value is T {
    return ! isUndefined(value)
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

export function isNil(value: unknown): value is Nil {
    return isUndefined(value) || isNull(value)
}

export function isNull(value: unknown): value is null {
    return value === null
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && ! isNaN(value)
    // We don't consider NaN a number.
}

export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
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
export function asNumber(value: string): undefined | number
export function asNumber<T>(value: T): unknown extends T ? undefined | number : undefined
export function asNumber(value: unknown): undefined | number {
    const result = Number(value)

    if (isNaN(result)) {
        return
    }

    return result
}


export function asNumberInteger(value: number): number
export function asNumberInteger(value: string): undefined | number
export function asNumberInteger<T>(value: T): unknown extends T ? undefined | number : undefined
export function asNumberInteger(value: unknown): undefined | number {
    const result = Number(value)

    if (isNaN(result)) {
        return
    }

    return Math.trunc(result)
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

export type ValueOf<T> = T[keyof T]

export type Defined<O> = {
    [P in keyof O]-?: Exclude<O[P], undefined>
}

export type ElementOf<A extends Array<unknown>> =
    A extends Array<infer T>
        ? T
        : never

export type PromiseOf<T extends Promise<unknown>> =
    T extends Promise<infer R>
        ? R
        : never

export type UnionFrom<T extends Array<unknown>> = T[number]

export type PartialDeep<T> =
    T extends object
        ? {[P in keyof T]?: PartialDeep<T[P]>}
        : T
