import type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'
import {createBus as createStdBus} from '@eviljs/std/bus.js'
import {useContext, useEffect, useMemo} from 'react'
import {defineContext} from './ctx.js'

export type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'

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
    const {bus, children, context: contextOptional} = props
    const contextDefault = BusContext as React.Context<undefined | Bus>
    const Context = contextOptional ?? contextDefault

    const value = useMemo(() => {
        return ! bus
            ? createStdBus()
            : bus
    }, [bus])

    return <Context.Provider value={value} children={children}/>
}

export function useBus(
    contextOptional?: undefined | React.Context<undefined | Bus>,
): undefined | Bus {
    const contextDefault = BusContext as React.Context<undefined | Bus>

    return useContext(contextOptional ?? contextDefault)
}

export function useBusEvent<P = unknown>(
    event: BusEvent,
    observer: undefined | BusEventObserver<P>,
    contextOptional?: undefined | React.Context<undefined | Bus>,
) {
    const bus = useBus(contextOptional)!

    useEffect(() => {
        if (! observer) {
            return
        }

        const unobserve = bus.observe(event, observer)

        function onClean() {
            unobserve?.()
        }

        return onClean
    }, [bus, event, observer])
}

export function createBus(context: React.Context<undefined | Bus>): BusBound {
    const self: BusBound = {
        BusProvider(props) {
            return <BusProvider context={context} {...props}/>
        },
        useBus() {
            return useBus(context)
        },
        useBusEvent(event: BusEvent, observer: undefined | BusEventObserver) {
            useBusEvent(event, observer, context)
        },
    }
    ;(self.BusProvider as React.FunctionComponent).displayName = 'BusProviderFactory'

    return self
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusProviderProps {
    bus?: undefined | Bus
    children?: undefined | React.ReactNode
    context?: undefined | React.Context<undefined | Bus>
}

export interface BusBound {
    BusProvider: {
        (props: BusProviderProps): JSX.Element,
    },
    useBus: {
        (): undefined | Bus
    }
    useBusEvent: {
        (event: BusEvent, observer: undefined | BusEventObserver): void
    }
}
