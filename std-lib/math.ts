export function sum(items: Array<number>, getter?: never): number;
export function sum<I>(items: Array<I>, getter: ItemAccessor<I, number>): number;
export function sum<I>(items: Array<number | I>, getter?: ItemAccessor<number | I, number>): number {
    const total = items.reduce((sum: number, it) =>
        sum + getItemValue(it, getter)
    , 0)

    return total
}

export function average(items: Array<number>, getter?: never): number;
export function average<I>(items: Array<I>, getter: ItemAccessor<I, number>): number;
export function average<I>(items: Array<I>, getter?: ItemAccessor<I, number>): number {
    // @ts-ignore
    const total = sum(items, getter)

    return total / items.length
}

export function minMax(items: Array<number>, getter?: never): MinMax;
export function minMax<I>(items: Array<I>, getter: ItemAccessor<I, number>): MinMax;
export function minMax<I>(items: Array<number | I>, getter?: ItemAccessor<number | I, number>): MinMax {
    let min: MinMaxValue = undefined
    let max: MinMaxValue = undefined

    for (const it of items) {
        const value = getItemValue(it, getter)
        min = Math.min(value, min ?? value)
        max = Math.max(value, max ?? value)
    }

    return [min, max]
}

export function getItemValue<I, R>(it: I | R, getter?: ItemAccessor<I | R, R>): R {
    return getter?.(it as I) ?? (it as R)
}

// Types ///////////////////////////////////////////////////////////////////////

export type MinMaxValue = number | undefined
export type MinMax = readonly [MinMaxValue, MinMaxValue]

export interface ItemAccessor<I, R> {
    (it: I): R
}
