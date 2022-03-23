import {useCallback, useMemo, useState} from 'react'
import {NoItems} from './model.js'

export function useFilter<I, F>(
    items: undefined | Array<I>,
    test: (filters: F, it: I) => boolean,
    initialFilters: F | (() => F),
): Filter<I, F> {
    const [filters, setFilters] = useState<F>(initialFilters)

    const filteredItems = useMemo(() => {
        if (! items) {
            return NoItems
        }
        return items.filter(it => test(filters, it))
    }, [items, filters, test])

    const itemIdxOf = useCallback((filteredItemIdx: number) => {
        return resolveFilteredItemIdx(items ?? NoItems, filteredItems, filteredItemIdx)
    }, [items, filteredItems])

    const onChangeFilters = setFilters

    return {filters, filteredItems, itemIdxOf, onChangeFilters}
}

export function resolveFilteredItemIdx<I>(
    items: Array<I>,
    filteredItems: Array<I>,
    filteredItemIdx: number,
) {
    const filteredItem = filteredItems[filteredItemIdx]

    if (! filteredItem) {
        return
    }

    const itemIdx = items.indexOf(filteredItem)

    return (itemIdx >= 0)
        ? itemIdx
        : undefined
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Filter<I, F extends {}> {
    filters: F
    filteredItems: Array<I>
    itemIdxOf: (filteredItemIdx: number) => undefined | number
    onChangeFilters: React.Dispatch<React.SetStateAction<F>>
}
