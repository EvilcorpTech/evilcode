import {times} from './iter.js'

export function randomInt(minOptional?: undefined | number, maxOptional?: undefined | number): number {
    const min = minOptional ?? 0
    const max = maxOptional ?? Number.MAX_SAFE_INTEGER
    return Math.floor(Math.random() * (max + 1 - min)) + min
}

export function randomTimes(min: number, max: number): Array<number> {
    return times(randomInt(min, max))
}

export function randomItem<I>(list: Array<I> | readonly [...Array<I>]): I {
    const idx = randomInt(0, list.length - 1)
    const item = list[idx]!
    return item
}

export function randomItems<I>(list: Array<I>, min = 2, max?: number): Array<I> {
    const count = Math.min(list.length, max ?? Number.MAX_SAFE_INTEGER)
    const uniqueItems: Array<I> = []
    const items = randomTimes(min, count).map(() => randomItem(list))

    for (const item of items) {
        if (uniqueItems.includes(item)) {
            continue
        }
        // Unique item.
        uniqueItems.push(item)
    }

    return uniqueItems
}
