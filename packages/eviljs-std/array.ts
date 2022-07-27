import {isNotNil, Nil} from './type.js'

export function lastOf<I>(list: Array<I>): undefined | I {
    return list[list.length - 1]
}

export function withoutNil<I>(list: Array<Nil | I>): Array<I> {
    return list.filter(isNotNil)
}

export function mapWith<I>(mapItem: (it: I) => I) {
    function mapList(list: Array<I>) {
        return list.map(mapItem)
    }

    return mapList
}

export function asMatrix<T>(list: Array<T>, size: number) {
    return list.reduce((rows, key, index) => {
        if ((index % size) === 0) {
            rows.push([key])
        }
        else {
            rows[rows.length - 1]?.push(key)
        }
        return rows
    }, [] as Array<Array<T>>)
}
