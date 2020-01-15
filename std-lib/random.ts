export function times(count: number) {
    return Array(count).fill(undefined).map((nil, idx) => idx)
}

export function randomInt(min = 0, max = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * (max + 1 - min)) + min
}

export function randomTimes(min: number, max: number) {
    return times(randomInt(min, max))
}

export function randomItem(list: Array<unknown>) {
    return list[randomInt(0, list.length - 1)]
}

export function randomItems(list: Array<unknown>, min = 2, max?: number) {
    const items = randomTimes(min, max
        ? Math.min(max, list.length)
        : list.length
    )
    .map(() => randomItem(list))
    .reduce((list: Array<unknown>, item) => {
        // Unique items.
        if (! list.includes(item)) {
            list.push(item)
        }

        return list
    }, [])

    return items
}