export function sortingOn<I, R extends undefined | number | string>(
    getItemValue: (item: I) => R,
    collatorOptional?: undefined | Intl.Collator,
) {
    const collator = collatorOptional ?? new Intl.Collator(undefined, {
        numeric: true, // '1' < '2' < '10'.
    })

    function onSort(a: I, b: I) {
        return collator.compare(
            String(getItemValue(a) ?? ''),
            String(getItemValue(b) ?? ''),
        )
    }

    return onSort
}

export function invertedSort<A extends Array<unknown>>(
    fn: (...args: A) => number,
) {
    function invert(...args: A) {
        return -1 * fn(...args)
    }

    return invert
}

export function filteringOn<I, R extends boolean | number | string>(
    getItemValue: (item: I) => undefined | R,
) {
    function onFilter(filterValue: R, item: I) {
        return getItemValue(item) === filterValue
    }

    return onFilter
}
