import {throwInvalidArgument} from './throw.js'
import {isArray, isBoolean, isDate, isFunction, isInteger, isNil, isNumber, isObject, isString, isUndefined} from './type.js'

// Assertions //////////////////////////////////////////////////////////////////

export function assertArray(value: unknown, ctx?: any): asserts value is Array<unknown> {
    ensureArray(value, ctx)
}

export function assertArrayOptional(value: unknown, ctx?: any): asserts value is undefined | Array<unknown> {
    ensureArrayOptional(value, ctx)
}

export function assertBoolean(value: unknown, ctx?: any): asserts value is boolean {
    ensureBoolean(value, ctx)
}

export function assertBooleanOptional(value: unknown, ctx?: any): asserts value is undefined | boolean {
    ensureBooleanOptional(value, ctx)
}

export function assertDate(value: unknown, ctx?: any): asserts value is Date {
    ensureDate(value, ctx)
}

export function assertDateOptional(value: unknown, ctx?: any): asserts value is undefined | Date {
    ensureDateOptional(value, ctx)
}

export function assertEnum<E>(value: unknown, enumValues: Array<E>, ctx?: any): asserts value is E {
    ensureEnum(value, enumValues, ctx)
}

export function assertEnumOptional<E>(value: unknown, enumValues: Array<E>, ctx?: any): asserts value is undefined | E {
    ensureEnumOptional(value, enumValues, ctx)
}

export function assertFunction(value: unknown, ctx?: any): asserts value is Function {
    ensureFunction(value, ctx)
}

export function assertFunctionOptional(value: unknown, ctx?: any): asserts value is undefined | Function {
    ensureFunctionOptional(value, ctx)
}

export function assertInteger(value: unknown, ctx?: any): asserts value is number {
    ensureInteger(value, ctx)
}

export function assertIntegerOptional(value: unknown, ctx?: any): asserts value is undefined | number {
    ensureIntegerOptional(value, ctx)
}

export function assertNumber(value: unknown, ctx?: any): asserts value is number {
    ensureNumber(value, ctx)
}

export function assertNumberOptional(value: unknown, ctx?: any): asserts value is undefined | number {
    ensureNumberOptional(value, ctx)
}

export function assertObject(value: unknown, ctx?: any): asserts value is Record<PropertyKey, any> {
    ensureObject(value, ctx)
}

export function assertObjectOptional(value: unknown, ctx?: any): asserts value is undefined | Record<PropertyKey, any> {
    ensureObjectOptional(value, ctx)
}

export function assertString(value: unknown, ctx?: any): asserts value is string {
    ensureString(value, ctx)
}

export function assertStringOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureStringOptional(value, ctx)
}

export function assertStringNotEmpty(value: unknown, ctx?: any): asserts value is string {
    ensureStringNotEmpty(value, ctx)
}

export function assertStringNotEmptyOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureStringNotEmptyOptional(value, ctx)
}

export function assertUndefined(value: unknown, ctx?: any): asserts value is undefined {
    ensureUndefined(value, ctx)
}

// Assurances //////////////////////////////////////////////////////////////////

export function ensureArray<T extends Array<unknown>>(value: T, ctx?: any): T
export function ensureArray(value: unknown, ctx?: any): Array<unknown>
export function ensureArray(value: unknown, ctx?: any) {
    if (! isArray(value)) {
        return throwAssertError('an Array', value, ctx)
    }

    return value
}

export function ensureArrayOptional<T extends undefined | Array<unknown>>(value: T, ctx?: any): T
export function ensureArrayOptional(value: unknown, ctx?: any): undefined | Array<unknown>
export function ensureArrayOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureArray, value, ctx)
}

export function ensureBoolean<T extends boolean>(value: T, ctx?: any): T
export function ensureBoolean(value: unknown, ctx?: any): boolean
export function ensureBoolean(value: unknown, ctx?: any) {
    if (! isBoolean(value)) {
        return throwAssertError('a Boolean', value, ctx)
    }

    return value
}

export function ensureBooleanOptional<T extends undefined | boolean>(value: T, ctx?: any): T
export function ensureBooleanOptional(value: unknown, ctx?: any): undefined | boolean
export function ensureBooleanOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureBoolean, value, ctx)
}

export function ensureDate<T extends Date>(value: T, ctx?: any): T
export function ensureDate(value: unknown, ctx?: any): Date
export function ensureDate(value: unknown, ctx?: any) {
    if (! isDate(value)) {
        return throwAssertError('a Date', value, ctx)
    }

    return value
}

export function ensureDateOptional<T extends undefined | Date>(value: T, ctx?: any): T
export function ensureDateOptional(value: unknown, ctx?: any): undefined | Date
export function ensureDateOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureDate, value, ctx)
}

export function ensureEnum<E, T extends E>(value: T, enumValues: Array<E>, ctx?: any): T
export function ensureEnum<E>(value: unknown, enumValues: Array<E>, ctx?: any): E
export function ensureEnum<E>(value: unknown, enumValues: Array<E>, ctx?: any) {
    assertArray(enumValues, `${ctx} enum`)

    for (const enumValue of enumValues) {
        if (value === enumValue) {
            return value
        }
    }

    return throwAssertError(`one of ${enumValues.join(' | ')}`, value, ctx)
}

export function ensureEnumOptional<E, T extends undefined | E>(value: T, enumValues: Array<E>, ctx?: any): T
export function ensureEnumOptional<E>(value: unknown, enumValues: Array<E>, ctx?: any): undefined | E
export function ensureEnumOptional<E>(value: unknown, enumValues: Array<E>, ctx?: any) {
    return ensureOptionalWith(ensureEnum, value, enumValues, ctx)
}

export function ensureFunction<T extends Function>(value: T, ctx?: any): T
export function ensureFunction(value: unknown, ctx?: any): Function
export function ensureFunction(value: unknown, ctx?: any) {
    if (! isFunction(value)) {
        return throwAssertError('a Function', value, ctx)
    }

    return value
}

export function ensureFunctionOptional<T extends undefined | Function>(value: T, ctx?: any): T
export function ensureFunctionOptional(value: unknown, ctx?: any): undefined | Function
export function ensureFunctionOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureFunction, value, ctx)
}

export function ensureInteger<T extends number>(value: T, ctx?: any): T
export function ensureInteger(value: unknown, ctx?: any): number
export function ensureInteger(value: unknown, ctx?: any) {
    assertNumber(value, ctx)

    if (! isInteger(value)) {
        return throwAssertError('an Integer', value, ctx)
    }

    return value
}

export function ensureIntegerOptional<T extends undefined | number>(value: T, ctx?: any): T
export function ensureIntegerOptional(value: unknown, ctx?: any): undefined | number
export function ensureIntegerOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureInteger, value, ctx)
}

export function ensureNumber<T extends number>(value: T, ctx?: any): T
export function ensureNumber(value: unknown, ctx?: any): number
export function ensureNumber(value: unknown, ctx?: any) {
    if (! isNumber(value)) {
        return throwAssertError('a Number', value, ctx)
    }

    return value
}

export function ensureNumberOptional<T extends undefined | number>(value: T, ctx?: any): T
export function ensureNumberOptional(value: unknown, ctx?: any): undefined | number
export function ensureNumberOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureNumber, value, ctx)
}

export function ensureObject<T extends {} | Record<PropertyKey, unknown>>(value: T, ctx?: any): T
export function ensureObject(value: unknown, ctx?: any): Record<PropertyKey, unknown>
export function ensureObject(value: unknown, ctx?: any) {
    if (! isObject(value)) {
        return throwAssertError('an Object', value, ctx)
    }

    return value
}

export function ensureObjectOptional<T extends undefined | {} | Record<PropertyKey, unknown>>(value: T, ctx?: any): T
export function ensureObjectOptional(value: unknown, ctx?: any): undefined | Record<PropertyKey, unknown>
export function ensureObjectOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureObject, value, ctx)
}

export function ensureString<T extends string>(value: T, ctx?: any): T
export function ensureString(value: unknown, ctx?: any): string
export function ensureString(value: unknown, ctx?: any) {
    if (! isString(value)) {
        return throwAssertError('a String', value, ctx)
    }

    return value
}

export function ensureStringOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureStringOptional(value: unknown, ctx?: any): undefined | string
export function ensureStringOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureString, value, value, ctx)
}

export function ensureStringNotEmpty<T extends string>(value: T, ctx?: any): T
export function ensureStringNotEmpty(value: unknown, ctx?: any): string
export function ensureStringNotEmpty(value: unknown, ctx?: any) {
    if (ensureString(value, ctx).trim() === '') {
        return throwAssertError('a not empty String', value, ctx)
    }

    return value
}

export function ensureStringNotEmptyOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureStringNotEmptyOptional(value: unknown, ctx?: any): undefined | string
export function ensureStringNotEmptyOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureStringNotEmpty, value, ctx)
}

export function ensureUndefined<T extends undefined>(value: T, ctx?: any): T
export function ensureUndefined(value: unknown, ctx?: any): undefined
export function ensureUndefined(value: unknown, ctx?: any) {
    if (value !== void undefined) {
        return throwAssertError('undefined', value, ctx)
    }

    return
}

export function ensureOptionalWith<T>(assertion: Assertion<T>, value: undefined | T, ...args: Array<unknown>) {
    if (! isUndefined(value)) {
        return assertion(value, ...args)
    }

    return
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

export function throwAssertError(type: string, value: unknown, ctx?: any) {
    return throwInvalidArgument(errorMessage(type, value, ctx))
}

// Types ///////////////////////////////////////////////////////////////////////

export type Assertion<T> = (value: T, ...args: Array<any>) => T
