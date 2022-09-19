import {isNotNil, Nil} from './type.js'

export function lastOf<I>(list: Array<I>): undefined | I {
    return list[list.length - 1]
}

export function withoutNil<I>(list: Array<Nil | I>): Array<I> {
    return list.filter(isNotNil)
}

export function mapWith<I, R>(mapItem: (it: I, idx: number) => R) {
    function mapList(list: Array<I>) {
        return list.map(mapItem)
    }

    return mapList
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

export function move<I>(list: Array<I>, from: number, to: number) {
    const listClone = Array.from(list)
    moveMutating(listClone, from, to)
    return listClone
}

export function moveMutating<I>(list: Array<I>, from: number, to: number) {
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
