import {compute} from './fn-compute.js'
import {throwInvalidCondition} from './throw.js'
import {
    ensureArray,
    ensureArrayOptional,
    ensureBoolean,
    ensureBooleanOptional,
    ensureDate,
    ensureDateOptional,
    ensureDefined,
    ensureEnum,
    ensureEnumOptional,
    ensureFunction,
    ensureFunctionOptional,
    ensureInteger,
    ensureIntegerOptional,
    ensureNumber,
    ensureNumberOptional,
    ensureObject,
    ensureObjectOptional,
    ensureSome,
    ensureString,
    ensureStringNotEmpty,
    ensureStringNotEmptyOptional,
    ensureStringOptional,
    ensureUndefined,
} from './type-ensure.js'

// Assertions //////////////////////////////////////////////////////////////////

/**
* @throws Error
*/
export function assert(condition: boolean, error: string | (() => string)): void {
    if (! condition) {
        throwInvalidCondition(compute(error))
    }
}

/**
* @throws InvalidType
*/
export function assertArray(value: unknown, ctx?: any): asserts value is Array<unknown> {
    ensureArray(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertArrayOptional(value: unknown, ctx?: any): asserts value is undefined | Array<unknown> {
    ensureArrayOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertBoolean(value: unknown, ctx?: any): asserts value is boolean {
    ensureBoolean(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertBooleanOptional(value: unknown, ctx?: any): asserts value is undefined | boolean {
    ensureBooleanOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertDate(value: unknown, ctx?: any): asserts value is Date {
    ensureDate(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertDateOptional(value: unknown, ctx?: any): asserts value is undefined | Date {
    ensureDateOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertDefined(value: unknown, ctx?: any): asserts value is null | {} {
    ensureDefined(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertEnum<E>(value: unknown, enumValues: Array<E>, ctx?: any): asserts value is E {
    ensureEnum(value, enumValues, ctx)
}

/**
* @throws InvalidType
*/
export function assertEnumOptional<E>(value: unknown, enumValues: Array<E>, ctx?: any): asserts value is undefined | E {
    ensureEnumOptional(value, enumValues, ctx)
}

/**
* @throws InvalidType
*/
export function assertFunction(value: unknown, ctx?: any): asserts value is Function {
    ensureFunction(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertFunctionOptional(value: unknown, ctx?: any): asserts value is undefined | Function {
    ensureFunctionOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertNumber(value: unknown, ctx?: any): asserts value is number {
    ensureNumber(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertNumberOptional(value: unknown, ctx?: any): asserts value is undefined | number {
    ensureNumberOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertInteger(value: unknown, ctx?: any): asserts value is number {
    ensureInteger(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertIntegerOptional(value: unknown, ctx?: any): asserts value is undefined | number {
    ensureIntegerOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertObject(value: unknown, ctx?: any): asserts value is Record<PropertyKey, any> {
    ensureObject(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertObjectOptional(value: unknown, ctx?: any): asserts value is undefined | Record<PropertyKey, any> {
    ensureObjectOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertSome(value: unknown, ctx?: any): asserts value is {} {
    ensureSome(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertString(value: unknown, ctx?: any): asserts value is string {
    ensureString(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertStringOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureStringOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertStringNotEmpty(value: unknown, ctx?: any): asserts value is string {
    ensureStringNotEmpty(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertStringNotEmptyOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureStringNotEmptyOptional(value, ctx)
}

/**
* @throws InvalidType
*/
export function assertUndefined(value: unknown, ctx?: any): asserts value is undefined {
    ensureUndefined(value, ctx)
}
