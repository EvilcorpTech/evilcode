import {assertStringNotEmpty, ensureOptionalWith, throwAssertTypeError} from './assert.js'
import {isBetween} from './math.js'
import {isString} from './type.js'

export function cloneDate(date: Date) {
    return new Date(date.getTime())
}

export function isDateBetween(from: undefined | Date, date: Date, to: undefined | Date) {
    if (! from && ! to) {
        return true
    }
    if (from && to) {
        return isBetween(from.getTime(), date.getTime(), to.getTime())
    }
    if (from) {
        return from.getTime() <= date.getTime()
    }
    if (to) {
        return to.getTime() >= date.getTime()
    }
    return false
}

export function dateNow(): Date {
    return new Date()
}

// Guards //////////////////////////////////////////////////////////////////////

export function isDateString(value: unknown): value is string {
    if (! value || ! isString(value) || ! Boolean(Date.parse(value))) {
        return false
    }
    return true
}

export function isDateIsoUtcString(value: unknown): value is string {
    if (! isString(value)) {
        return false
    }

    const isoMarker = 't'
    const utcZone = 'z'
    const valueLowerCase = value.toLowerCase()
    const includesIsoMarker = valueLowerCase.includes(isoMarker)
    const includesUtcZone = includesIsoMarker && valueLowerCase.includes(utcZone)
    const isIsoUtcString = includesUtcZone

    return isIsoUtcString
}

// Assertions //////////////////////////////////////////////////////////////////

/**
* @throws InvalidInput
*/
export function assertDateString(value: unknown, ctx?: any): asserts value is string {
    ensureDateString(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertDateStringOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureDateStringOptional(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertDateAsIsoUtcString(value: unknown, ctx?: any): asserts value is string {
    ensureDateAsIsoUtcString(value, ctx)
}

/**
* @throws InvalidInput
*/
export function assertDateAsIsoUtcStringOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureDateAsIsoUtcStringOptional(value, ctx)
}

// Assurances //////////////////////////////////////////////////////////////////

/**
* @throws InvalidInput
*/
export function ensureDateString<T extends string>(value: T, ctx?: any): T
export function ensureDateString(value: unknown, ctx?: any): string
export function ensureDateString(value: unknown, ctx?: any) {
    assertStringNotEmpty(value, ctx)

    if (! isDateString(value)) {
        return throwAssertTypeError('a Date string', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureDateStringOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureDateStringOptional(value: unknown, ctx?: any): undefined | string
export function ensureDateStringOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureDateString, value, ctx)
}

/**
* @throws InvalidInput
*/
export function ensureDateAsIsoUtcString<T extends string>(value: T, ctx?: any): T
export function ensureDateAsIsoUtcString(value: unknown, ctx?: any): string
export function ensureDateAsIsoUtcString(value: unknown, ctx?: any) {
    assertDateString(value, ctx)

    if (! isDateIsoUtcString(value)) {
        return throwAssertTypeError('a Date as ISO string with UTC timezone', value, ctx)
    }

    return value
}

/**
* @throws InvalidInput
*/
export function ensureDateAsIsoUtcStringOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureDateAsIsoUtcStringOptional(value: unknown, ctx?: any): undefined | string
export function ensureDateAsIsoUtcStringOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureDateAsIsoUtcString, value, ctx)
}
