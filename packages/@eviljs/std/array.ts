import type {Io} from './fn.js'
import type {Nil} from './type.js'
import {isSome} from './type.js'

export function areArraysEqual(a: Array<unknown>, b: Array<unknown>): boolean {
    if (a.length !== b.length) {
        return false
    }

    return a.every((_, idx) => a[idx] === b[idx])
}

export function firstOf<I>(list: Array<I>): undefined | I {
    return list[0]
}

export function lastOf<I>(list: Array<I>): undefined | I {
    return list.at(-1)
}

export function filterSome<I>(list: Array<Nil | I>): Array<I> {
    return list.filter(isSome)
}

export function mappingWith<I, R>(mapItem: (it: I, idx: number) => R) {
    function mapList(list: Array<I>) {
        return list.map(mapItem)
    }

    return mapList
}

export function groupBy<I, K extends PropertyKey>(
    list: Array<I>,
    keyOf: Io<I, K>,
): Record<K, Array<I>> {
    const groups = {} as Record<K, Array<I>>

    for (const it of list) {
        const key = keyOf(it)
        groups[key] ??= []
        groups[key]?.push(it)
    }

    return groups
}

export function groupMapBy<I, K>(
    list: Array<I>,
    keyOf: Io<I, K>,
): Map<K, Array<I>> {
    const groupsMap = new Map<K, Array<I>>()

    function setupKey(key: K) {
        const group: Array<I> = []
        groupsMap.set(key, group)
        return group
    }

    for (const it of list) {
        const key = keyOf(it)
        const group = groupsMap.get(key) ?? setupKey(key)
        group?.push(it)
    }

    return groupsMap
}

export function asMatrix<I>(list: Array<I>, size: number) {
    return list.reduce((rows, key, index) => {
        if ((index % size) === 0) {
            rows.push([key])
        }
        else {
            rows[rows.length - 1]?.push(key)
        }
        return rows
    }, [] as Array<Array<I>>)
}

export function moveItem<I>(list: Array<I>, from: number, to: number): Array<I> {
    const listClone = Array.from(list)
    moveItemReference(listClone, from, to)
    return listClone
}

export function moveItemReference<I>(list: Array<I>, from: number, to: number): void {
    if (from < 0) {
        return
    }
    if (from >= list.length) {
        return
    }

    const item = list[from]
    list.splice(from, 1)
    list.splice(to, 0, item!)
}
