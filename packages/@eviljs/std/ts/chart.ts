import {times} from './iter.js'

export function createNumberAxis(min: number, max: number, ticks: number): Array<number> {
    if (min === max) {
        return []
    }

    const gap = (max - min) / (ticks - 1)
    const items = times(ticks).map(idx => min + (gap * idx))
    return items
}

export function createDateAxis(min: Date, max: Date, ticks: number): Array<Date> {
    const axis = createNumberAxis(min.getTime(), max.getTime(), ticks)
    const items = axis.map(it => new Date(it))
    return items
}
