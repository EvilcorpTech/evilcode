import {throwInvalidArgument} from './error.js'
import {isArray, isBoolean, isFunction, isInteger, isNumber, isObject, isString} from './type.js'
import {isDate, isDateString, isDateIsoUtcString} from './type.js'
import {isUndefined} from './type.js'

export function assertOptionalWith<T>(assertion: Assertion<T>, value: unknown, ...args: Array<unknown>) {
    if (isUndefined(value)) {
        return
    }

    return assertion(value, ...args)
}

export function assertArray(value: unknown, name?: string) {
    if (isArray(value)) {
        return value
    }

    return throwError('an Array', value, name)
}

export function assertArrayOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertArray, value, name)
}

export function assertBoolean(value: unknown, name?: string) {
    if (isBoolean(value)) {
        return value
    }

    return throwError('a Boolean', value, name)
}

export function assertBooleanOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertBoolean, value, name)
}

export function assertDate(value: unknown, name?: string) {
    if (isDate(value)) {
        return value
    }

    return throwError('a Date', value, name)
}

export function assertDateOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertDate, value, name)
}

export function assertDateString(value: unknown, name?: string) {
    assertStringNotEmpty(value, name)

    if (isDateString(value)) {
        return value
    }

    return throwError('a Date string', value, name)
}

export function assertDateStringOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertDateString, value, name)
}

export function assertDateAsIsoUtcString(value: unknown, name?: string) {
    assertDateString(value, name)

    if (isDateIsoUtcString(value)) {
        return value
    }

    return throwError('a Date as ISO string with UTC timezone', value, name)
}

export function assertDateAsIsoUtcStringOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertDateAsIsoUtcString, value, name)
}

export function assertEnum(value: unknown, enumValues: Array<unknown>, name?: string) {
    assertArray(enumValues, `${name} enum`)

    for (const enumValue of enumValues) {
        if (value === enumValue) {
            return value
        }
    }

    return throwError(`one of ${enumValues.join(' | ')}`, value, name)
}

export function assertEnumOptional(value: unknown, enumValues: Array<unknown>, name?: string) {
    return assertOptionalWith(assertEnum, value, enumValues, name)
}

export function assertFunction(value: unknown, name?: string) {
    if (isFunction(value)) {
        return value
    }

    return throwError('a Function', value, name)
}

export function assertFunctionOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertFunction, value, name)
}

export function assertInteger(value: unknown, name?: string) {
    assertNumber(value, name)

    if (isInteger(value)) {
        return value
    }

    return throwError('an Integer', value, name)
}

export function assertIntegerOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertInteger, value, name)
}

export function assertNumber(value: unknown, name?: string) {
    if (isNumber(value)) {
        return value
    }

    return throwError('a Number', value, name)
}

export function assertNumberOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertNumber, value, name)
}

export function assertObject(value: unknown, name?: string) {
    if (isObject(value)) {
        return value
    }

    return throwError('an Object', value, name)
}

export function assertObjectOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertObject, value, name)
}

export function assertString(value: unknown, name?: string) {
    if (isString(value)) {
        return value
    }

    return throwError('a String', value, name)
}

export function assertStringOptional(value: unknown, name?: string) {
    if (value === '') {
        return value
    }

    return assertOptionalWith(assertString, value, value, name)
}

export function assertStringNotEmpty(value: unknown, name?: string) {
    assertString(value, name)

    if (isString(value) && value.trim() !== '') {
        return value
    }

    return throwError('a not empty String', value, name)
}

export function assertStringNotEmptyOptional(value: unknown, name?: string) {
    return assertOptionalWith(assertStringNotEmpty, value, name)
}

export function assertUndefined(value: unknown, name?: string) {
    if (value === void undefined) {
        return
    }

    return throwError('undefined', value, name)
}

export function errorMessage(type: string, value: unknown, name?: string) {
    return `${name ? `"${name}"` : 'value'} must be ${type}, given "${value}".`
}

export function throwError(type: string, value: unknown, name?: string) {
    return throwInvalidArgument(errorMessage(type, value, name))
}

// Types ///////////////////////////////////////////////////////////////////////

export type Assertion<T> = (value: unknown, ...args: Array<any>) => T
