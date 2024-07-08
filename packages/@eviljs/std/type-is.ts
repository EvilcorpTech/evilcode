import type {FnArgs} from './fn-type.js'
import type {None} from './type.js'

export const BooleanLikeTrue = [true, 1, '1', 'yes', 'on', 'true'] as const
export const BooleanLikeFalse = [false, 0, '0', 'no', 'off', 'false'] as const
export const BooleanLike = [...BooleanLikeTrue, ...BooleanLikeFalse] as [...typeof BooleanLikeTrue, ...typeof BooleanLikeFalse]

export function isDefined<V>(value: void | undefined | V): value is V {
    return ! isUndefined(value)
}

export function isNone(value: unknown): value is None {
    return isUndefined(value) || isNull(value)
}

export function isNull(value: unknown): value is null {
    return value === null
}

export function isSome<V>(value: void | None | V): value is V {
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
