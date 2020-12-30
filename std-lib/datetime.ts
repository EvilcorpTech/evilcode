import {assertStringNotEmpty, ensureOptionalWith, throwError} from './assert.js'
import {isString} from './type.js'

// Assertions //////////////////////////////////////////////////////////////////

export function assertDateString(value: unknown, ctx?: any): asserts value is string {
    ensureDateString(value, ctx)
}

export function assertDateStringOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureDateStringOptional(value, ctx)
}

export function assertDateAsIsoUtcString(value: unknown, ctx?: any): asserts value is string {
    ensureDateAsIsoUtcString(value, ctx)
}

export function assertDateAsIsoUtcStringOptional(value: unknown, ctx?: any): asserts value is undefined | string {
    ensureDateAsIsoUtcStringOptional(value, ctx)
}

// Assurances //////////////////////////////////////////////////////////////////

export function ensureDateString<T extends string>(value: T, ctx?: any): T
export function ensureDateString(value: unknown, ctx?: any): string
export function ensureDateString(value: unknown, ctx?: any) {
    assertStringNotEmpty(value, ctx)

    if (! isDateString(value)) {
        return throwError('a Date string', value, ctx)
    }

    return value
}

export function ensureDateStringOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureDateStringOptional(value: unknown, ctx?: any): undefined | string
export function ensureDateStringOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureDateString, value, ctx)
}

export function ensureDateAsIsoUtcString<T extends string>(value: T, ctx?: any): T
export function ensureDateAsIsoUtcString(value: unknown, ctx?: any): string
export function ensureDateAsIsoUtcString(value: unknown, ctx?: any) {
    assertDateString(value, ctx)

    if (! isDateIsoUtcString(value)) {
        return throwError('a Date as ISO string with UTC timezone', value, ctx)
    }

    return value
}

export function ensureDateAsIsoUtcStringOptional<T extends undefined | string>(value: T, ctx?: any): T
export function ensureDateAsIsoUtcStringOptional(value: unknown, ctx?: any): undefined | string
export function ensureDateAsIsoUtcStringOptional(value: unknown, ctx?: any) {
    return ensureOptionalWith(ensureDateAsIsoUtcString, value, ctx)
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

// Structures //////////////////////////////////////////////////////////////////

export function datetime(date: Date) {
    const self: Datetime = Object.defineProperties(
        [
            year(date),
            month(date),
            day(date),
            hour(date),
            minute(date),
            second(date),
            ms(date),
        ] as const,
        {
            year: {get() { return self[0] }},
            month: {get() { return self[1] }},
            day: {get() { return self[2] }},
            hour: {get() { return self[3] }},
            minute: {get() { return self[4] }},
            second: {get() { return self[5] }},
            ms: {get() { return self[6] }},
        },
    )

    Object.freeze(self)

    return self
}

export function dateFrom(datetime: Datetime) {
    const date = new Date(
        datetime[0], // Year.
        datetime[1], // Month.
        datetime[2], // Day.
        datetime[3] - 1, // Hour (Date month starts from 0).
        datetime[4], // Minute.
        datetime[5], // Second.
        datetime[6], // Ms.
    )

    return date
}

export function year(date: Date) {
    return date.getFullYear()
}

export function month(date: Date) {
    return date.getMonth() + 1
}

export function day(date: Date) {
    return date.getDate()
}

export function hour(date: Date) {
    return date.getHours()
}

export function minute(date: Date) {
    return date.getMinutes()
}

export function second(date: Date) {
    return date.getSeconds()
}

export function ms(date: Date) {
    return date.getMilliseconds()
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Datetime extends ReadonlyArray<number>, DatetimeTuple, DatetimeDict {
}

export interface DatetimeTuple {
    readonly [0]: number // Year.
    readonly [1]: number // Month.
    readonly [2]: number // Day.
    readonly [3]: number // Hour.
    readonly [4]: number // Minute.
    readonly [5]: number // Second.
    readonly [6]: number // Ms.
}

export interface DatetimeDict {
    readonly year: number
    readonly month: number
    readonly day: number
    readonly hour: number
    readonly minute: number
    readonly second: number
    readonly ms: number
}
