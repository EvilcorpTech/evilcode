import {times} from './fn'

export function randomInt(min = 0, max = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * (max + 1 - min)) + min
}

export function randomTimes(min: number, max: number) {
    return times(randomInt(min, max))
}

export function randomItem<T>(list: Array<T>) {
    const idx = randomInt(0, list.length - 1)
    const item = list[idx]
    return item
}

export function randomItems<T>(list: Array<T>, min = 2, max?: number) {
    const count = Math.min(list.length, max ?? Number.MAX_SAFE_INTEGER)
    const uniqueItems: Array<T> = []
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
