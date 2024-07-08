import type {FnArgs} from './fn-type.js'

export const CollatorOptionsDefault: Intl.CollatorOptions = {
    numeric: true, // '1' < '2' < '10'.
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
): (first: I, second: I) => number {
    const collator = collatorOptional instanceof Intl.Collator
        ? collatorOptional
        : new Intl.Collator(undefined, {...CollatorOptionsDefault, ...collatorOptional})

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
    function invert(...args: A) {
        return -1 * fn(...args)
    }

    return invert
}
