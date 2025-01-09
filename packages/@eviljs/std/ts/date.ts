import {isBetween} from './math.js'
import {throwInvalidType} from './throw.js'
import {assertStringNotEmpty} from './type-assert.js'
import {ensureOptionalWith, InvalidTypeMessage} from './type-ensure.js'
import {isDefined, isString} from './type-is.js'

export const OneSecondInMs: number = 1_000
export const OneMinuteInMs: number = 60 * OneSecondInMs
export const OneHourInMs: number = 60 * OneMinuteInMs
export const OneDayInMs: number = 24 * OneHourInMs
export const OneWeekInMs: number = 7 * OneDayInMs
export const OneMonthInMs: number = 30 * OneDayInMs
export const OneYearInMs: number = 365 * OneDayInMs

export function dateNow(): Date {
    return new Date()
}

export function cloneDate(date: Date): Date {
    return new Date(date.getTime())
}

export function isTimeBetween(from: undefined | DateNumber, date: DateNumber, to: undefined | DateNumber): boolean {
    const fromDefined = isDefined(from)
    const toDefined = isDefined(to)

    if (! fromDefined && ! toDefined) {
        return true
    }
    if (fromDefined && toDefined) {
        return isBetween(from, date, to)
    }
    if (fromDefined) {
        return from <= date
    }
    if (toDefined) {
        return to >= date
    }
    return false
}

export function isDateBetween(from: undefined | Date, date: Date, to: undefined | Date): boolean {
    return isTimeBetween(from?.getTime(), date.getTime(), to?.getTime())
}

export function roundTimeToSeconds(time: DateNumber): number {
    return Math.trunc(time / 1_000) * 1_000
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
        return throwInvalidType(InvalidTypeMessage('a Date string', value, ctx))
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
        return throwInvalidType(InvalidTypeMessage('a Date as ISO string with UTC timezone', value, ctx))
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

// Types ///////////////////////////////////////////////////////////////////////

export type DateNumber = number
export type Milliseconds = number
