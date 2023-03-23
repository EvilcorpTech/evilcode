import type {Bus, BusEvent, BusObserver} from '@eviljs/std/bus.js'
import {createBus} from '@eviljs/std/bus.js'
import {useCallback, useContext, useEffect, useMemo} from 'react'
import {defineContext} from './ctx.js'

export const BusContext = defineContext<Bus>('BusContext')

/*
* EXAMPLE
*
* return (
*     <BusProvider>
*         <MyApp/>
*     </BusProvider>
* )
*/
export function BusProvider(props: BusProviderProps) {
    const {children} = props

    const bus = useMemo(() => {
        return createBus()
    }, [])

    return (
        <BusContext.Provider value={bus}>
            {children}
        </BusContext.Provider>
    )
}

export function useBus<T extends undefined | Bus = undefined | Bus>() {
    return useContext(BusContext) as T
}

export function useBusEvent<P>(
    event: BusEvent,
    observer: BusObserver<P>,
) {
    const bus = useBus()!

    useEffect(() => {
        const unobserve = bus.observe(event, observer as BusObserver)

        function onClean() {
            unobserve()
        }

        return onClean
    }, [bus, event, observer])

    const unobserve = useCallback(() => {
        bus.unobserve(event, observer as BusObserver)
    }, [bus, event, observer])

    return unobserve
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusProviderProps {
    children?: undefined | React.ReactNode
}
