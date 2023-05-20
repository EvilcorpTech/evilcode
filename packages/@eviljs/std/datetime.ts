import {dateNow} from './date.js'

// Structures //////////////////////////////////////////////////////////////////

export function datetimeNow(): Datetime {
    return datetimeFrom(dateNow())
}

export function datetimeFrom(date: Date) {
    const dict: DatetimeDict = {
        year: year(date),
        month: month(date),
        day: day(date),
        hour: hour(date),
        minute: minute(date),
        second: second(date),
        ms: ms(date),
    }
    const tuple: DatetimeTuple = [
        dict.year,
        dict.month,
        dict.day,
        dict.hour,
        dict.minute,
        dict.second,
        dict.ms,
    ]
    const datetime: Datetime = Object.defineProperties(tuple, {
        year: { value: dict.year },
        month: { value: dict.month },
        day: { value: dict.day },
        hour: { value: dict.hour },
        minute: { value: dict.minute },
        second: { value: dict.second },
        ms: { value: dict.ms },
    }) as Datetime

    const frozenDatetime = Object.freeze(datetime)

    return frozenDatetime
}

export function dateFrom(datetime: Datetime) {
    return new Date(
        datetime[0], // Year.
        datetime[1], // Month.
        datetime[2], // Day.
        datetime[3] - 1, // Hour (Date month starts from 0).
        datetime[4], // Minute.
        datetime[5], // Second.
        datetime[6], // Ms.
    )
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

export interface Datetime extends DatetimeTuple, DatetimeDict {
}

export interface DatetimeTuple {
    [0]: number // Year.
    [1]: number // Month.
    [2]: number // Day.
    [3]: number // Hour.
    [4]: number // Minute.
    [5]: number // Second.
    [6]: number // Ms.
}

export interface DatetimeDict {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
    ms: number
}
