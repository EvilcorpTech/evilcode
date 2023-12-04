import type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'
import {useContext, useEffect} from 'react'
import {BusContext, BusProvider, type BusProviderProps} from './bus-provider.js'

export type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'
export * from './bus-provider.js'

export function useBus(
    contextOptional?: undefined | React.Context<undefined | Bus>,
): Bus {
    const contextDefault = BusContext as React.Context<undefined | Bus>

    return useContext(contextOptional ?? contextDefault)!
}

export function useBusEvent<P = unknown>(
    event: BusEvent,
    observer: undefined | BusEventObserver<P>,
    contextOptional?: undefined | React.Context<undefined | Bus>,
) {
    const bus = useBus(contextOptional)

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

export interface BusBound {
    BusProvider: {
        (props: BusProviderProps): JSX.Element,
    },
    useBus: {
        (): Bus
    }
    useBusEvent: {
        (event: BusEvent, observer: undefined | BusEventObserver): void
    }
}
