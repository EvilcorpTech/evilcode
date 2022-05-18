import {Bus, BusGeneric, BusEvent, BusEvents, BusObserver, createBus} from '@eviljs/std/bus.js'
import {createContext, useCallback, useContext, useLayoutEffect, useMemo} from 'react'

export const BusContext = createContext<unknown>(undefined)

BusContext.displayName = 'BusContext'

export function useBus<B extends BusEvents>() {
    return useMemo(() => {
        return createBus<B>()
    }, [])
}

export function useBusEvent<P>(
    event: BusEvent,
    observer: BusObserver<P>,
) {
    const bus = useContext<Bus<BusGeneric>>(BusContext as React.Context<Bus<BusGeneric>>)

    useLayoutEffect(() => {
        const unobserve = bus.observe(event, observer as BusObserver)

        return unobserve
    }, [bus, event, observer])

    const unobserve = useCallback(() => {
        bus.unobserve(event, observer as BusObserver)
    }, [bus, event, observer])

    return unobserve
}
