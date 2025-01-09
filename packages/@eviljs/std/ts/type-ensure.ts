import {throwInvalidType} from './throw.js'
import {isArray, isBoolean, isDate, isDefined, isFunction, isInteger, isNumber, isObject, isSome, isString, isUndefined} from './type-is.js'
import type {None} from './type-types.js'

export function InvalidTypeMessage(expected: string, actual: unknown, ctx?: any): string {
    if (isString(ctx)) {
        return `${ctx} must be ${expected}, given "${actual}".`
    }
    if (isSome(ctx)) {
        return `value must be ${expected}, given "${actual}":\n${JSON.stringify(ctx)}`
    }
    return `value must be ${expected}, given "${actual}".`
}

// Assurances //////////////////////////////////////////////////////////////////

/**
* @throws InvalidInput
*/
export function ensureArray<T extends Array<unknown>>(value: T, ctx?: any): T
export function ensureArray(value: unknown, ctx?: any): Array<unknown>
export function ensureArray(value: unknown, ctx?: any) {
    if (! isArray(value)) {
        return throwInvalidType(InvalidTypeMessage('an Array', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('a Boolean', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('a Date', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('defined', value, ctx))
    }
    return value
}

/**
* @throws InvalidInput
*/

export function ensureEnum<E extends Array<unknown>, T extends E[number]>(value: T, enumValues: E | [...E] | readonly [...E], ctx?: any): T
export function ensureEnum<E extends Array<unknown>>(value: unknown, enumValues: E | [...E] | readonly [...E], ctx?: any): E[number]
export function ensureEnum(value: unknown, enumValues: Array<unknown>, ctx?: any) {
    if (ensureArray(enumValues, `${ctx} enum`).includes(value)) {
        return value
    }
    return throwInvalidType(InvalidTypeMessage(`one of ${enumValues.join(' | ')}`, value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('a Function', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('a Number', value, ctx))
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
    if (! isInteger(ensureNumber(value, ctx))) {
        return throwInvalidType(InvalidTypeMessage('an Integer', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('an Object', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('not undefined and not null', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('a String', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('a not empty String', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('undefined', value, ctx))
    }
    return
}

/**
* @throws InvalidInput
*/
export function ensureOptionalWith<T>(assertion: Assertion<T>, value: undefined | T, ...args: Array<unknown>): undefined | T {
    if (isDefined(value)) {
        return assertion(value, ...args)
    }
    return
}

// Types ///////////////////////////////////////////////////////////////////////

export type Assertion<T> = (value: T, ...args: Array<any>) => T
