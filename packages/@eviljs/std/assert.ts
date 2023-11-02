import {compute} from './compute.js'
import {StdError, throwError} from './throw.js'
import type {None} from './type.js'
import {
    isArray,
    isBoolean,
    isDate,
    isDefined,
    isFunction,
    isInteger,
    isNone,
    isNumber,
    isObject,
    isSome,
    isString,
    isUndefined,
} from './type.js'

export class InvalidCondition extends StdError {}
export class InvalidType extends StdError {}

/**
* @throws InvalidCondition
*/
export function throwAssertConditionError(message: string) {
    return throwError({type: InvalidCondition, message})
}

/**
* @throws InvalidType
*/
export function throwAssertTypeError(type: string, value: unknown, ctx?: any) {
    const message = errorMessage(type, value, ctx)
    return throwError({type: InvalidType, message})
}

// Assertions //////////////////////////////////////////////////////////////////

/**
* @throws Error
*/
export function assert(condition: boolean, error: string | (() => string)): void {
    if (! condition) {
        throwAssertConditionError(compute(error))
    }
}

/**
* @throws InvalidInput
*/
export function assertArray(value: unknown, ctx?: any): asserts value is Array<unknown> {
    ensureArray(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertArrayOptional(value: unknown, ctx?: any): asserts value is undefined | Array<unknown> {
    ensureArrayOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertBoolean(value: unknown, ctx?: any): asserts value is boolean {
    ensureBoolean(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertBooleanOptional(value: unknown, ctx?: any): asserts value is undefined | boolean {
    ensureBooleanOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertDate(value: unknown, ctx?: any): asserts value is Date {
    ensureDate(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertDateOptional(value: unknown, ctx?: any): asserts value is undefined | Date {
    ensureDateOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertDefined(value: unknown, ctx?: any): asserts value is null | {} {
    ensureDefined(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertEnum<E>(value: unknown, enumValues: Array<E>, ctx?: any): asserts value is E {
    ensureEnum(value, enumValues, ctx)
}

/**
* @throws InvalidInput
*/
export function assertEnumOptional<E>(value: unknown, enumValues: Array<E>, ctx?: any): asserts value is undefined | E {
    ensureEnumOptional(value, enumValues, ctx)
}

/**
* @throws InvalidInput
*/
export function assertFunction(value: unknown, ctx?: any): asserts value is Function {
    ensureFunction(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertFunctionOptional(value: unknown, ctx?: any): asserts value is undefined | Function {
    ensureFunctionOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertNumber(value: unknown, ctx?: any): asserts value is number {
    ensureNumber(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertNumberOptional(value: unknown, ctx?: any): asserts value is undefined | number {
    ensureNumberOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertInteger(value: unknown, ctx?: any): asserts value is number {
    ensureInteger(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertIntegerOptional(value: unknown, ctx?: any): asserts value is undefined | number {
    ensureIntegerOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertObject(value: unknown, ctx?: any): asserts value is Record<PropertyKey, any> {
    ensureObject(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertObjectOptional(value: unknown, ctx?: any): asserts value is undefined | Record<PropertyKey, any> {
    ensureObjectOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertSome(value: unknown, ctx?: any): asserts value is {} {
    ensureSome(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertString(value: unknown, ctx?: any): asserts value is string {
    ensureString(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertStringOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureStringOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertStringNotEmpty(value: unknown, ctx?: any): asserts value is string {
    ensureStringNotEmpty(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertStringNotEmptyOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureStringNotEmptyOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertUndefined(value: unknown, ctx?: any): asserts value is undefined {
    ensureUndefined(value, ctx)
}

// Assurances //////////////////////////////////////////////////////////////////

/**
* @throws InvalidInput
*/
export function ensureArray<T extends Array<unknown>>(value: T, ctx?: any): T
export function ensureArray(value: unknown, ctx?: any): Array<unknown>
export function ensureArray(value: unknown, ctx?: any) {
    if (! isArray(value)) {
        return throwAssertTypeError('an Array', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureArrayOptional<T extends undefined | Array<unknown>>(value: T, ctx?: any): T
export function ensureArrayOptional(value: unknown, ctx?: any): undefined | Array<unknown>
export function ensureArrayOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureArray, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureBoolean<T extends boolean>(value: T, ctx?: any): T
export function ensureBoolean(value: unknown, ctx?: any): boolean
export function ensureBoolean(value: unknown, ctx?: any) {
    if (! isBoolean(value)) {
        return throwAssertTypeError('a Boolean', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureBooleanOptional<T extends undefined | boolean>(value: T, ctx?: any): T
export function ensureBooleanOptional(value: unknown, ctx?: any): undefined | boolean
export function ensureBooleanOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureBoolean, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureDate<T extends Date>(value: T, ctx?: any): T
export function ensureDate(value: unknown, ctx?: any): Date
export function ensureDate(value: unknown, ctx?: any) {
    if (! isDate(value)) {
        return throwAssertTypeError('a Date', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureDateOptional<T extends undefined | Date>(value: T, ctx?: any): T
export function ensureDateOptional(value: unknown, ctx?: any): undefined | Date
export function ensureDateOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureDate, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureDefined(value: undefined, ctx?: any): never
export function ensureDefined<T>(value: undefined | T, ctx?: any): T
export function ensureDefined<T>(value: undefined | T, ctx?: any): T {
    if (! isDefined(value)) {
        return throwAssertTypeError('defined', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureEnum<E, T extends E>(value: T, enumValues: Array<E>, ctx?: any): T
export function ensureEnum<E>(value: unknown, enumValues: Array<E>, ctx?: any): E
export function ensureEnum<E>(value: unknown, enumValues: Array<E>, ctx?: any) {
    assertArray(enumValues, `${ctx} enum`)

    for (const enumValue of enumValues) {
        if (value === enumValue) {
            return value
        }
    }

    return throwAssertTypeError(`one of ${enumValues.join(' | ')}`, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureEnumOptional<E, T extends undefined | E>(value: T, enumValues: Array<E>, ctx?: any): T
export function ensureEnumOptional<E>(value: unknown, enumValues: Array<E>, ctx?: any): undefined | E
export function ensureEnumOptional<E>(value: unknown, enumValues: Array<E>, ctx?: any) {
    return ensureOptionalWith(ensureEnum, value, enumValues, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureFunction<T extends Function>(value: T, ctx?: any): T
export function ensureFunction(value: unknown, ctx?: any): Function
export function ensureFunction(value: unknown, ctx?: any) {
    if (! isFunction(value)) {
        return throwAssertTypeError('a Function', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureFunctionOptional<T extends undefined | Function>(value: T, ctx?: any): T
export function ensureFunctionOptional(value: unknown, ctx?: any): undefined | Function
export function ensureFunctionOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureFunction, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureNumber<T extends number>(value: T, ctx?: any): T
export function ensureNumber(value: unknown, ctx?: any): number
export function ensureNumber(value: unknown, ctx?: any) {
    if (! isNumber(value)) {
        return throwAssertTypeError('a Number', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureNumberOptional<T extends undefined | number>(value: T, ctx?: any): T
export function ensureNumberOptional(value: unknown, ctx?: any): undefined | number
export function ensureNumberOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureNumber, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureInteger<T extends number>(value: T, ctx?: any): T
export function ensureInteger(value: unknown, ctx?: any): number
export function ensureInteger(value: unknown, ctx?: any) {
    assertNumber(value, ctx)

    if (! isInteger(value)) {
        return throwAssertTypeError('an Integer', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureIntegerOptional<T extends undefined | number>(value: T, ctx?: any): T
export function ensureIntegerOptional(value: unknown, ctx?: any): undefined | number
export function ensureIntegerOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureInteger, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureObject<T extends object | Record<PropertyKey, unknown>>(value: T, ctx?: any): T
export function ensureObject(value: unknown, ctx?: any): Record<PropertyKey, unknown>
export function ensureObject(value: unknown, ctx?: any) {
    if (! isObject(value)) {
        return throwAssertTypeError('an Object', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureObjectOptional<T extends undefined | {} | Record<PropertyKey, unknown>>(value: T, ctx?: any): T
export function ensureObjectOptional(value: unknown, ctx?: any): undefined | Record<PropertyKey, unknown>
export function ensureObjectOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureObject, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureSome(value: None, ctx?: any): never
export function ensureSome<T>(value: None | T, ctx?: any): T
export function ensureSome<T>(value: None | T, ctx?: any): T {
    if (! isSome(value)) {
        return throwAssertTypeError('not undefined and not null', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureString<T extends string>(value: T, ctx?: any): T
export function ensureString(value: unknown, ctx?: any): string
export function ensureString(value: unknown, ctx?: any) {
    if (! isString(value)) {
        return throwAssertTypeError('a String', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureStringOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureStringOptional(value: unknown, ctx?: any): undefined | string
export function ensureStringOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureString, value, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureStringNotEmpty<T extends string>(value: T, ctx?: any): T
export function ensureStringNotEmpty(value: unknown, ctx?: any): string
export function ensureStringNotEmpty(value: unknown, ctx?: any) {
    if (ensureString(value, ctx).trim() === '') {
        return throwAssertTypeError('a not empty String', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureStringNotEmptyOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureStringNotEmptyOptional(value: unknown, ctx?: any): undefined | string
export function ensureStringNotEmptyOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureStringNotEmpty, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureUndefined(value: unknown, ctx?: any): undefined {
    if (! isUndefined(value)) {
        return throwAssertTypeError('undefined', value, ctx)
    }

    return
}

/**
* @throws InvalidInput
*/
export function ensureOptionalWith<T>(assertion: Assertion<T>, value: undefined | T, ...args: Array<unknown>) {
    if (! isUndefined(value)) {
        return assertion(value, ...args)
    }

    return
}

export function errorMessage(expected: string, actual: unknown, ctx?: any) {
    return (
        isNone(ctx)
            ? `value must be ${expected}, given "${actual}".`
        : isString(ctx)
            ? `${ctx} must be ${expected}, given "${actual}".`
        : `value must be ${expected}, given "${actual}":\n${JSON.stringify(ctx)}`
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export type Assertion<T> = (value: T, ...args: Array<any>) => T
