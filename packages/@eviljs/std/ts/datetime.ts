import {dateNow} from './date.js'

export function datetimeNow(): Datetime {
    return datetimeFrom(dateNow())
}

export function datetimeFrom(date: Date): Readonly<Datetime> {
    const dateYear = yearOf(date)
    const dateMonth = monthOf(date)
    const dateDay = dayOf(date)
    const dateHour = hourOf(date)
    const dateMinute = minuteOf(date)
    const dateSecond = secondOf(date)
    const dateMillisecond = millisecondOf(date)

    const datetime: Readonly<Datetime> = Object.freeze({
        year: dateYear,
        month: dateMonth,
        day: dateDay,
        hour: dateHour,
        minute: dateMinute,
        second: dateSecond,
        ms: dateMillisecond,
        [0]: dateYear,
        [1]: dateMonth,
        [2]: dateDay,
        [3]: dateHour,
        [4]: dateMinute,
        [5]: dateSecond,
        [6]: dateMillisecond,

        [Symbol.iterator]() {
            let idx: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0

            return {
                next(): {done: boolean, value: undefined | number} {
                    const value = datetime[idx]
                    idx += 1
                    return {done: value === undefined, value}
                },
                return(value: never): {done: boolean} {
                    return {done: true}
                },
            }
        },
    })

    return datetime
}

export function dateFrom(datetime: Datetime): Date {
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

export function yearOf(date: Date): number {
    return date.getFullYear()
}

export function monthOf(date: Date): number {
    return date.getMonth() + 1
}

export function dayOf(date: Date): number {
    return date.getDate()
}

export function hourOf(date: Date): number {
    return date.getHours()
}

export function minuteOf(date: Date): number {
    return date.getMinutes()
}

export function secondOf(date: Date): number {
    return date.getSeconds()
}

export function millisecondOf(date: Date): number {
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
