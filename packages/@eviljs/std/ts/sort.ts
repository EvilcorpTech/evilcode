import type {FnArgs} from './fn-type.js'

export const SortCollatorOptionsDefaults: Intl.CollatorOptions = {
    numeric: true, // '1' < '2' < '10'.
}

export function createComparator(
    options?: undefined | Intl.CollatorOptions,
    localeOptions?: undefined | Intl.LocalesArgument,
): Intl.Collator {
    return new Intl.Collator(localeOptions, {...SortCollatorOptionsDefaults, ...options})
}

export function sortingWith<I>(
    ...comparators: Array<(first: I, second: I) => number>
): (first: I, second: I) => number {
    function onSort(first: I, second: I): number {
        for (const comparator of comparators) {
            const result = comparator(first, second)

            if (result) {
                return result
            }
        }
        return 0
    }

    return onSort
}

/*
* EXAMPLE
*
* const list = [{id: 1, name: 'Mike'}, {id: 2, name: 'John'}]
* list.sort(sortingOn(it => it.id))
* list.sort(sortingOn(it => it.name))
*/
export function sortingOn<I, R extends undefined | number | string>(
    getter: (item: I) => R,
    collatorOptional?: undefined | Intl.Collator | Intl.CollatorOptions,
    localeOptions?: undefined | Intl.LocalesArgument,
): (first: I, second: I) => number {
    const collator = collatorOptional instanceof Intl.Collator
        ? collatorOptional
        : createComparator(collatorOptional, localeOptions)

    function onSort(first: I, second: I): number {
        return collator.compare(
            String(getter(first) ?? ''),
            String(getter(second) ?? ''),
        )
    }

    return onSort
}

/*
* EXAMPLE
*
* const list = [{id: 1, name: 'Mike'}]
* list.sort(inverting(sortingOn(it => it.id)))
*/
export function inverting<A extends FnArgs>(
    fn: (...args: A) => number,
): (...args: A) => number {
    function onInvert(...args: A) {
        return invert(fn(...args))
    }

    return onInvert
}

export function invert(result: number): number {
    return -1 * result
}
