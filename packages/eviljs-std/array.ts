import {isNil} from './type.js'

export function lastOf<I>(list: Array<I>): undefined | I {
    return list[list.length - 1]
}

export function definedOf<I>(list: Array<void | undefined | null | I>): Array<I> {
    return list.filter((it): it is I =>
        ! isNil(it)
    )
}

export function mapWith<I>(mapItem: (it: I) => I) {
    function mapper(list: Array<I>) {
        return list.map(mapItem)
    }

    return mapper
}

export function filterDefined<I>(item: void | undefined | null | I): item is I {
    return ! isNil(item)
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
