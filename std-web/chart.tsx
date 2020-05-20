import { times } from '@eviljs/std-lib/random'

export function createNumberAxis(data: Array<number>, ticks: number) {
    let min: number | null = null
    let max: number | null = null

    for (const it of data) {
        min = Math.min(min ?? it, it)
        max = Math.max(max ?? it, it)
    }

    if (min === null || max === null) {
        return []
    }
    if (min === max) {
        return []
    }

    const gap = (max - min) / (ticks - 1)
    const items = times(ticks).map(idx =>
        min! + (gap * idx)
    )

    return items
}

export function createDateAxis(data: Array<Date>, ticks: number) {
    const dataTimes = data.map(it => it.getTime())
    const items = createNumberAxis(dataTimes, ticks).map(it =>
        new Date(it)
    )

    return items
}
