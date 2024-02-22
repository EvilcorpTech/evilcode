import type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'
import {useEffect} from 'react'
import {BusProvider, useBusContext, type BusContextOptions, type BusProviderProps} from './bus-provider.js'

export type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'
export * from './bus-provider.js'

export function useBus(options?: undefined | BusContextOptions): Bus {
    return useBusContext(options)!
}

export function useBusEvent<P = unknown>(
    event: BusEvent,
    observer: undefined | BusEventObserver<P>,
    options?: undefined | BusContextOptions,
) {
    const bus = useBusContext(options)!

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

export function setupBus(options?: undefined | BusContextOptions): BusBound {
    return {
        BusProvider(props) {
            return (
                <BusProvider
                    context={options?.context}
                    bus={options?.bus}
                    {...props}
                />
            )
        },
        useBusContext() {
            return useBusContext(options)
        },
        useBus() {
            return useBus(options)
        },
        useBusEvent<P = unknown>(event: BusEvent, observer: undefined | BusEventObserver<P>) {
            useBusEvent(event, observer, options)
        },
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusBound {
    BusProvider: {
        (props: BusProviderProps): JSX.Element,
    },
    useBusContext: {
        (): undefined | Bus
    }
    useBus: {
        (): Bus
    }
    useBusEvent: {
        <P = unknown>(event: BusEvent, observer: undefined | BusEventObserver<P>): void
    }
}
