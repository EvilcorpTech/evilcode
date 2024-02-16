import type {FnArgs} from './fn.js'

export const TypeTest = {
    array: isArray,
    boolean: isBoolean,
    date: isDate,
    defined: isDefined,
    function: isFunction,
    integer: isInteger,
    iterator: isIterator,
    none: isNone,
    null: isNull,
    number: isNumber,
    object: isObject,
    promise: isPromise,
    regexp: isRegExp,
    some: isSome,
    string: isString,
    undefined: isUndefined,
}

export const BooleanLikeTrue = [true, 1, '1', 'yes', 'on', 'true']
export const BooleanLikeFalse = [false, 0, '0', 'no', 'off', 'false']
export const BooleanLike = [...BooleanLikeTrue, ...BooleanLikeFalse]

export function kindOf<T extends keyof typeof TypeTest>(value: unknown, ...tests: Array<T>): undefined | T {
    for (const kind of tests) {
        const test = TypeTest[kind] as ((value: unknown) => boolean)

        if (test(value)) {
            return kind
        }
    }
    return
}

// Tests ///////////////////////////////////////////////////////////////////////

export function isDefined<V>(value: void | undefined | V): value is V {
    return ! isUndefined(value)
}

export function isNone(value: unknown): value is None {
    return isUndefined(value) || isNull(value)
}

export function isNull(value: unknown): value is null {
    return value === null
}

export function isSome<V>(value: None | V): value is V {
    return ! isNone(value)
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

export function isFunction<O, A extends FnArgs, R>(value: O | ((...args: A) => R)): value is ((...args: A) => R)
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

    // Remember, remember, the fifth of November.
    // typeof null === 'object'. God damn JavaScript!

    const proto = Object.getPrototypeOf(value)

    if (! proto) {
        // Note: We don't handle/care of Object.create(null).
        return false
    }
    if (proto.constructor !== Object) {
        return false
    }
    return true
}

export function isPromise(value: unknown): value is Promise<unknown> {
    if (! value) {
        return false
    }
    return value instanceof Promise
}

export function isRegExp(value: unknown): value is RegExp {
    if (! value) {
        return false
    }
    return value instanceof RegExp
}

export function isString(value: unknown): value is string {
    return typeof value === 'string' || value instanceof String
}

export function isIterator(value: unknown):
    value is
        | Iterator<unknown, unknown, unknown>
        | AsyncIterator<unknown, unknown, unknown>
        | AsyncGenerator<unknown, unknown, unknown>
{
    return true
        && Boolean(value)
        && (value instanceof Object)
        && ('next' in value)
        && isFunction(value.next)
}

// Casts ///////////////////////////////////////////////////////////////////////

// export function asArray<V, I>(value: V | readonly I[]): [V] | readonly I[]
// export function asArray<V, I>(value: V | I[]): V[] | I[]
export function asArray<V, T extends unknown[]>(value: V | [...T]): [V] | [...T]
export function asArray<V, T extends unknown[]>(value: V | readonly [...T]): [V] | readonly [...T]
export function asArray<V, I>(value: V | Array<I>): [V] | Array<I>
export function asArray<V>(value: V | Array<V>): Array<V>
export function asArray<V>(value: V | Array<V>): Array<V> {
    if (! isArray(value)) {
        return [value] as Array<V>
    }
    return value as Array<V>
}

export function asObject<T extends Record<PropertyKey, unknown>>(value: T): T
export function asObject(value: unknown): undefined | Record<PropertyKey, unknown>
export function asObject(value: unknown): undefined | Record<PropertyKey, unknown> {
    if (! isObject(value)) {
        return
    }
    return value
}

export function asBoolean(value: unknown): undefined | boolean {
    if (! isBoolean(value)) {
        return
    }
    return value
}

export function asBooleanLike(value: unknown): undefined | boolean {
    if (BooleanLikeTrue.includes(value as any)) {
        return true
    }
    if (BooleanLikeFalse.includes(value as any)) {
        return false
    }
    return
}

export function asDate(value: number | Date): Date
export function asDate(value: unknown): undefined | Date
export function asDate(value: unknown): undefined | Date {
    if (isNone(value)) {
        return
    }
    if (isDate(value)) {
        return value
    }
    if (isNumber(value)) {
        return new Date(value)
    }
    if (isString(value)) {
        // Date.parse() is omnivorous:
        // it accepts everything, and everything not string is returned as NaN.
        return asDate(Date.parse(value))
    }
    return // Makes TypeScript happy.
}

export function asNumber(value: number): number
export function asNumber(value: unknown): undefined | number
export function asNumber(value: unknown): undefined | number {
    if (isNumber(value)) {
        return value
    }
    if (isString(value)) {
        // Only strings should be parsed:
        // - null and Arrays would be parsed as 0
        // - Symbols would throws an error
        return asNumber(Number(value))
    }
    return
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

export function asString<const S extends string>(value: S): S
export function asString(value: None | {}): undefined
export function asString(value: unknown): undefined | string
export function asString(value: unknown): undefined | string {
    if (! isString(value)) {
        return
    }
    return value
}

export function asStringNotEmpty(value: string): undefined | string
export function asStringNotEmpty(value: None | {}): undefined
export function asStringNotEmpty(value: unknown): undefined | string
export function asStringNotEmpty(value: unknown): undefined | string {
    return asString(value)?.trim() || undefined
}

export function asStringLike<const S extends string>(value: S): S
export function asStringLike(value: boolean | number): string
export function asStringLike(value: None | {}): undefined
export function asStringLike(value: unknown): undefined | string
export function asStringLike(value: unknown): undefined | string {
    if (isString(value)) {
        return value
    }
    if (isBoolean(value)) {
        return String(value)
    }
    if (isNumber(value)) {
        return String(value)
    }
    return
}

// Types ///////////////////////////////////////////////////////////////////////

export type None = undefined | null
export type Some<T> = NonNullable<T>

export type ObjectComplete<T extends object> = {
    [P in keyof T]-?: Exclude<T[P], undefined>
}

export type ObjectPartial<T extends object> = {
    [K in keyof T]?: undefined | T[K]
}

export type ObjectPartialDeep<T extends object> = {
    [K in keyof T]?: undefined | (T[K] extends object ? ObjectPartialDeep<T[K]> : T[K])
}

export type Unsafe<T> =
    T extends None | boolean | number | string | symbol
        ? None | T
    : T extends Array<infer I>
        ? None | Array<Unsafe<I>>
    : T extends object
        ? None | {[key in keyof T]?: None | Unsafe<T[key]>}
    : unknown

export type UnsafeObject<T extends object> = NonNullable<Unsafe<T>>

export type ValueOf<T> = T[keyof T]

export type ElementOf<A extends Array<unknown>> =
    A extends Array<infer T>
        ? T
        : never

export type UnionOf<T extends Array<unknown>> = T[number]

export type Writable<T> = { -readonly [P in keyof T]: T[P] }
export type WritableDeep<T> = { -readonly [P in keyof T]: WritableDeep<T[P]> }

export type StringAutocompleted = string & {}

export type Prettify<T> = {} & {
    [K in keyof T]: T[K]
}
