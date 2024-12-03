import {BooleanLikeFalse, BooleanLikeTrue, isArray, isBoolean, isDate, isNone, isNumber, isObject, isString, isUndefined} from './type-is.js'

// export function asArray<V, I>(value: V | readonly I[]): [V] | readonly I[]
// export function asArray<V, I>(value: V | I[]): V[] | I[]
export function asArray<V, A extends unknown[]>(value: V | [...A]): [V] | [...A]
export function asArray<V, A extends unknown[]>(value: V | readonly [...A]): [V] | readonly [...A]
export function asArray<V, I>(value: V | Array<I>): [V] | Array<I>
export function asArray<V>(value: V | Array<V>): Array<V>
export function asArray<V>(value: V | Array<V>): Array<V> {
    if (! isArray(value)) {
        return [value]
    }
    return value
}

export function asArrayStrict<V extends Array<unknown>, O>(value: O | [...V]): undefined | V
export function asArrayStrict(value: unknown): undefined | Array<unknown>
export function asArrayStrict(value: unknown): undefined | Array<unknown> {
    if (! isArray(value)) {
        return
    }
    return value
}

export function asObject<V extends Record<PropertyKey, unknown>>(value: V): V
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

export function asEnum<E extends boolean | number | string, V extends E>(value: V, enumValues: Array<E>): V
export function asEnum<E extends boolean | number | string>(value: unknown, enumValues: Array<E>): undefined | E
export function asEnum<E extends boolean | number | string>(value: unknown, enumValues: Array<E>) {
    return enumValues.includes(value as E)
        ? value
        : undefined
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

// export function asString<const S extends string>(value: S): S
export function asString<const S extends string, O>(value: O | S): undefined | S
export function asString(value: unknown): undefined | string
export function asString(value: unknown): undefined | string {
    if (! isString(value)) {
        return
    }
    return value
}

// export function asStringNotEmpty(value: string): undefined | string
// export function asStringNotEmpty<O>(value: O | string): undefined | string
// export function asStringNotEmpty(value: unknown): undefined | string
export function asStringNotEmpty(value: unknown): undefined | string {
    return asString(value)?.trim() || undefined
}

export function asStringLike(value: boolean | number | string): string
// export function asStringLike<O>(value: O | string): undefined | string
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
