export function sum(items: Array<number>) {
    return items.reduce((sum, it) => sum + it, 0)
}

export function average(items: Array<number>) {
    return sum(items) / items.length
}

export function minMax(items: Array<number>) {
    let min: number | undefined = undefined
    let max: number | undefined = undefined

    for (const it of items) {
        min = Math.min(it, min ?? it)
        max = Math.max(it, max ?? it)
    }

    return [min, max]
}
