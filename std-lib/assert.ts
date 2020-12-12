import {throwInvalidArgument} from './error.js'
import {isArray, isBoolean, isFunction, isInteger, isNil, isNumber, isObject, isString} from './type.js'
import {isDate, isDateString, isDateIsoUtcString} from './type.js'
import {isUndefined} from './type.js'

export function assertOptionalWith<T>(assertion: Assertion<T>, value: undefined | T, ...args: Array<unknown>) {
    if (isUndefined(value)) {
        return
    }

    return assertion(value, ...args)
}

export function assertArray<T extends Array<unknown>>(value: T, ctx?: any) {
    if (isArray(value)) {
        return value
    }

    return throwError('an Array', value, ctx)
}

export function assertArrayOptional<T extends Array<unknown>>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertArray, value, ctx)
}

export function assertBoolean<T extends boolean>(value: T, ctx?: any) {
    if (isBoolean(value)) {
        return value
    }

    return throwError('a Boolean', value, ctx)
}

export function assertBooleanOptional<T extends boolean>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertBoolean, value, ctx)
}

export function assertDate<T extends Date>(value: T, ctx?: any) {
    if (isDate(value)) {
        return value
    }

    return throwError('a Date', value, ctx)
}

export function assertDateOptional<T extends Date>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertDate, value, ctx)
}

export function assertDateString<T extends string>(value: T, ctx?: any) {
    assertStringNotEmpty(value, ctx)

    if (isDateString(value)) {
        return value
    }

    return throwError('a Date string', value, ctx)
}

export function assertDateStringOptional<T extends string>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertDateString, value, ctx)
}

export function assertDateAsIsoUtcString<T extends string>(value: T, ctx?: any) {
    assertDateString(value, ctx)

    if (isDateIsoUtcString(value)) {
        return value
    }

    return throwError('a Date as ISO string with UTC timezone', value, ctx)
}

export function assertDateAsIsoUtcStringOptional<T extends string>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertDateAsIsoUtcString, value, ctx)
}

export function assertEnum<E, T extends E>(value: T, enumValues: Array<E>, ctx?: any) {
    assertArray(enumValues, `${ctx} enum`)

    for (const enumValue of enumValues) {
        if (value === enumValue) {
            return value
        }
    }

    return throwError(`one of ${enumValues.join(' | ')}`, value, ctx)
}

export function assertEnumOptional<E, T extends E>(value: undefined | T, enumValues: Array<E>, ctx?: any) {
    return assertOptionalWith(assertEnum, value, enumValues, ctx)
}

export function assertFunction<T extends Function>(value: T, ctx?: any) {
    if (isFunction(value)) {
        return value
    }

    return throwError('a Function', value, ctx)
}

export function assertFunctionOptional<T extends Function>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertFunction, value, ctx)
}

export function assertInteger<T extends number>(value: T, ctx?: any) {
    assertNumber(value, ctx)

    if (isInteger(value)) {
        return value
    }

    return throwError('an Integer', value, ctx)
}

export function assertIntegerOptional<T extends number>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertInteger, value, ctx)
}

export function assertNumber<T extends number>(value: T, ctx?: any) {
    if (isNumber(value)) {
        return value
    }

    return throwError('a Number', value, ctx)
}

export function assertNumberOptional<T extends number>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertNumber, value, ctx)
}

export function assertObject<T extends {} | Record<PropertyKey, unknown>>(value: T, ctx?: any) {
    if (isObject(value)) {
        return value
    }

    return throwError('an Object', value, ctx)
}

export function assertObjectOptional<T extends {} | Record<PropertyKey, unknown>>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertObject, value, ctx)
}

export function assertString<T extends string>(value: T, ctx?: any) {
    if (isString(value)) {
        return value
    }

    return throwError('a String', value, ctx)
}

export function assertStringOptional<T extends string>(value: undefined | T, ctx?: any) {
    if (value === '') {
        return value
    }

    return assertOptionalWith(assertString, value, value, ctx)
}

export function assertStringNotEmpty<T extends string>(value: T, ctx?: any) {
    assertString(value, ctx)

    if (isString(value) && value.trim() !== '') {
        return value
    }

    return throwError('a not empty String', value, ctx)
}

export function assertStringNotEmptyOptional<T extends string>(value: undefined | T, ctx?: any) {
    return assertOptionalWith(assertStringNotEmpty, value, ctx)
}

export function assertUndefined<T extends undefined>(value: T, ctx?: any) {
    if (value === void undefined) {
        return
    }

    return throwError('undefined', value, ctx)
}

export function errorMessage(expected: string, actual: unknown, ctx?: any) {
    return (
        isNil(ctx)
            ? `value must be ${expected}, given "${actual}".`
        : isString(ctx)
            ? `${ctx} must be ${expected}, given "${actual}".`
        : `value must be ${expected}, given "${actual}":\n${JSON.stringify(ctx)}`
    )
}

export function throwError(type: string, value: unknown, ctx?: any) {
    return throwInvalidArgument(errorMessage(type, value, ctx))
}

// Types ///////////////////////////////////////////////////////////////////////

export type Assertion<T> = (value: T, ...args: Array<any>) => T
