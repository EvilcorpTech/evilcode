import {isDefined, isUndefined} from './type-is.js'

export function clamp(min: number, value: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

export function round(value: number, round: number) {
    return Math.trunc(value / round) * round
}

export function sum(items: Array<number>, getter?: undefined): number;
export function sum<I>(items: Array<I>, getter: NumberGetter<I>): number;
export function sum<I>(items: Array<number> | Array<I>, getter?: undefined | NumberGetter<I>): number {
    const total = (items as Array<I>).reduce((sum: number, it) =>
        sum + readItemNumber(it, getter as NumberGetter<I>)
    , 0)

    return total
}

export function average(items: Array<number>, getter?: undefined): number;
export function average<I>(items: Array<I>, getter: NumberGetter<I>): number;
export function average<I>(items: Array<number> | Array<I>, getter?: undefined | NumberGetter<I>): number {
    const total = sum(items as Array<I>, getter as NumberGetter<I>)

    return total / items.length
}

export function minMax(items: Array<number>, getter?: undefined): MinMaxMaybe;
export function minMax<I>(items: Array<I>, getter: NumberGetter<I>): MinMaxMaybe;
export function minMax<I>(items: Array<number> | Array<I>, getter?: undefined | NumberGetter<I>): MinMaxMaybe {
    let min: undefined | number = undefined
    let max: undefined | number = undefined

    for (const it of items) {
        const value = readItemNumber(it as I, getter as NumberGetter<I>)
        min = Math.min(value, min ?? value)
        max = Math.max(value, max ?? value)
    }

    if (isUndefined(min) || isUndefined(max)) {
        return [undefined, undefined]
    }

    return [min, max]
}

export function minMaxOrZero(items: Array<number>, getter?: undefined): MinMax;
export function minMaxOrZero<I>(items: Array<I>, getter: NumberGetter<I>): MinMax;
export function minMaxOrZero<I>(items: Array<number> | Array<I>, getter?: undefined | NumberGetter<I>): MinMax {
    const [min, max] = minMax(items as Array<I>, getter as NumberGetter<I>)
    return [min ?? 0, max ?? 0]
}

export function readItemNumber(it: number, getter?: undefined): number
export function readItemNumber<I>(it: I, getter: NumberGetter<I>): number
export function readItemNumber<I>(it: number | I, getter?: undefined | NumberGetter<I>): number {
    return isDefined(getter)
        ? getter(it as I)
        : it as number
}

export function isBetween(a: number, value: number, b: number) {
    return (
        false
        || (a <= value && value <= b)
        || (b <= value && value <= a)
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export type MinMaxMaybe = [undefined, undefined] | MinMax
export type MinMax = [number, number]
export type NumberGetter<I> = (it: I) => number
