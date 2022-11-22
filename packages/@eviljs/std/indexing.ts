import type {Fn} from './fn.js'

/*
* Stores an item inside an object, returning the object. Useful when used inside
* an Array.reduce() function.
*
* EXAMPLE
* const index = indexBy({}, {key: 123}, it => it.key)
* [{id: 123}, {id: 234}].reduce((index, it) => indexBy(index, it, it => id), {})
*/
export function indexBy<
    X extends Record<PropertyKey, unknown>,
    K extends keyof X,
    T extends X[K],
>(
    index: X,
    item: T,
    by: Fn<[item: T], K>,
): X {
    const key = by(item)

    index[key] = item

    return index
}

export function indexingBy<
    X extends Record<PropertyKey, unknown>,
    K extends keyof X,
    T extends X[K],
>(
    by: Fn<[item: T], K>,
): Fn<[index: X, item: T], X> {
    function indexItem(index: X, item: T) {
        return indexBy(index, item, by)
    }

    return indexItem
}
