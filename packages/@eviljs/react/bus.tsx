import type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'
import {createBus} from '@eviljs/std/bus.js'
import type {TaskVoid} from '@eviljs/std/fn.js'
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
        <BusContext.Provider value={bus} children={children}/>
    )
}

export function useBus<T extends undefined | Bus = undefined | Bus>() {
    return useContext(BusContext) as T
}

export function useBusEvent(event: BusEvent, observer: BusEventObserver): TaskVoid {
    const bus = useBus()!

    useEffect(() => {
        const unobserve = bus.observe(event, observer)

        function onClean() {
            unobserve()
        }

        return onClean
    }, [bus, event, observer])

    const unobserve = useCallback(() => {
        bus.unobserve(event, observer)
    }, [bus, event, observer])

    return unobserve
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusProviderProps {
    children?: undefined | React.ReactNode
}
