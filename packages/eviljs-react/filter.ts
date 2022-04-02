import {useCallback, useMemo, useState} from 'react'
import {NoItems} from './model.js'

export function useFilter<I, F>(
    items: undefined | Array<I>,
    test: (filter: F, it: I) => boolean,
    initialFilter: F | (() => F),
): FilterManager<I, F> {
    const [filter, setFilter] = useState<F>(initialFilter)

    const filteredItems = useMemo(() => {
        if (! items) {
            return NoItems
        }
        return items.filter(it => test(filter, it))
    }, [items, filter, test])

    const itemIdxOf = useCallback((filteredItemIdx: number) => {
        return resolveFilteredItemIdx(items ?? NoItems, filteredItems, filteredItemIdx)
    }, [items, filteredItems])

    const onChange = setFilter

    return {filter, filteredItems, itemIdxOf, onChange}
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

export interface FilterManager<I, F> {
    filter: F
    filteredItems: Array<I>
    itemIdxOf: (filteredItemIdx: number) => undefined | number
    onChange: React.Dispatch<React.SetStateAction<F>>
}