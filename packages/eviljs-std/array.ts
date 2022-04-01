import {isNil} from './type.js'

export function lastOf<I>(list: Array<I>) {
    return list[list.length - 1]
}

export function mapWith<I>(mapItem: (it: I) => I) {
    function mapper(list: Array<I>) {
        return list.map(mapItem)
    }

    return mapper
}

export function filterDefined<I>(list: Array<void | undefined | null | I>): Array<I> {
    return list.filter((it): it is I =>
        ! isNil(it)
    )
}
