export function clamp(min: number, value: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

export function sum(items: Array<number>, getter?: undefined): number;
export function sum<I>(items: Array<I>, getter: ItemGetter<I>): number;
export function sum<I>(items: Array<number> | Array<I>, getter?: undefined | ItemGetter<I>): number {
    const total = (items as Array<I>).reduce((sum: number, it) =>
        sum + valueForItem(it, getter as ItemGetter<I>)
    , 0)

    return total
}

export function average(items: Array<number>, getter?: undefined): number;
export function average<I>(items: Array<I>, getter: ItemGetter<I>): number;
export function average<I>(items: Array<number> | Array<I>, getter?: undefined | ItemGetter<I>): number {
    const total = sum(items as Array<I>, getter as ItemGetter<I>)

    return total / items.length
}

export function minMax(items: Array<number>, getter?: undefined): MaybeMinMax;
export function minMax<I>(items: Array<I>, getter: ItemGetter<I>): MaybeMinMax;
export function minMax<I>(items: Array<number> | Array<I>, getter?: undefined | ItemGetter<I>): MaybeMinMax {
    let min: undefined | number = undefined
    let max: undefined | number = undefined

    for (const it of items) {
        const value = valueForItem(it as I, getter as ItemGetter<I>)
        min = Math.min(value, min ?? value)
        max = Math.max(value, max ?? value)
    }

    if (! min || ! max) {
        return [undefined, undefined]
    }

    return [min, max]
}

export function minMaxOrZero(items: Array<number>, getter?: undefined): MinMax;
export function minMaxOrZero<I>(items: Array<I>, getter: ItemGetter<I>): MinMax;
export function minMaxOrZero<I>(items: Array<number> | Array<I>, getter?: undefined | ItemGetter<I>): MinMax {
    const [min, max] = minMax(items as Array<I>, getter as ItemGetter<I>)
    return [min ?? 0, max ?? 0]
}

export function valueForItem(it: number, getter?: undefined): number
export function valueForItem<I>(it: I, getter: ItemGetter<I>): number
export function valueForItem<I>(it: number | I, getter?: undefined | ItemGetter<I>): number {
    return getter?.(it as I) ?? it as number
}

// Types ///////////////////////////////////////////////////////////////////////

export type MaybeMinMax = [undefined, undefined] | MinMax
export type MinMax = [number, number]

export interface ItemGetter<I> {
    (it: I): number
}
