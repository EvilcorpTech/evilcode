import type {Io} from './fn.js'
import type {None} from './type.js'
import {isSome} from './type.js'

export function areArraysEqual(firstList: Array<unknown>, secondList: Array<unknown>): boolean {
    if (firstList.length !== secondList.length) {
        return false
    }

    return firstList.every((_, idx) => firstList[idx] === secondList[idx])
}

export function firstOf<I>(list: Array<I>): undefined | I {
    return list[0]
}

export function lastOf<I>(list: Array<I>): undefined | I {
    return list.at(-1)
}

export function filterSome<I>(list: Array<None | I>): Array<I> {
    return list.filter(isSome)
}

export function mappingWith<I, R>(mapItem: (it: I, idx: number) => R) {
    function mapList(list: Array<I>) {
        return list.map(mapItem)
    }

    return mapList
}

export function uniq<I>(list: Array<I>): Array<I> {
    return Array.from(new Set(list))
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

export function intersectBy<I, K>(keyOf: Io<I, K>, ...lists: Array<Array<I>>): Array<I> {
    const intersectionList: Array<I> = []
    const uniqueItemsMap = new Map(lists.flat().map(it => [keyOf(it), it]))

    for (const [itemKey, item] of uniqueItemsMap.entries()) {
        const itemKeyIsInEveryList = lists.every(list =>
            list.some(it => keyOf(it) === itemKey)
        )
        if (! itemKeyIsInEveryList) {
            continue
        }
        intersectionList.push(item)
    }

    return intersectionList
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
