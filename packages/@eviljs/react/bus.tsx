import {createBus, type Bus, type BusEvent, type BusEventObserver} from '@eviljs/std/bus.js'
import {useContext, useEffect, useMemo} from 'react'
import {defineContext} from './ctx.js'

export {createBus, type Bus, type BusEvent, type BusEventObserver, type BusEventPayloadOf} from '@eviljs/std/bus.js'

export function setupBus(options: BusBoundCase1Options): BusBoundCase1Exports
export function setupBus(options?: undefined | BusBoundCase2Options): BusBoundCase2Exports
export function setupBus(options?: undefined | BusBoundCase1Options | BusBoundCase2Options): BusBoundCase1Exports | BusBoundCase2Exports {
    if (options && 'bus' in options) {
        return setupBusUsingSingleton(options)
    }
    return setupBusUsingContext(options)
}

export function setupBusUsingSingleton(options: BusBoundCase1Options): BusBoundCase1Exports {
    const {bus} = options

    return {
        useBus() {
            return bus
        },
        useBusEvent(event, observer) {
            useBusEvent(bus, event, observer)
        },
    }
}

export function setupBusUsingContext(options?: undefined | BusBoundCase2Options): BusBoundCase2Exports {
    const Context = options?.context ?? defineContext<Bus>(options?.contextName ?? 'BusContext')

    return {
        BusContext: Context,
        BusProvider(props) {
            return (
                <Context.Provider value={useBusProvider()}>
                    {props.children}
                </Context.Provider>
            )
        },
        useBusContext() {
            return useContext(Context)
        },
        useBusProvider: useBusProvider,
        useBus() {
            return useContext(Context)!
        },
        useBusEvent(event, observer) {
            useBusEvent(useContext(Context)!, event, observer)
        },
    }
}

export function useBusProvider(): Bus {
    const bus = useMemo(() => {
        return createBus()
    }, [])

    return bus
}

export function useBusEvent<P = unknown>(bus: Bus, event: BusEvent, observer: undefined | BusEventObserver<P>) {
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

// Types ///////////////////////////////////////////////////////////////////////

export interface BusBoundCase1Options {
    bus: Bus
}
export interface BusBoundCase1Exports {
    useBus: {
        (): Bus
    }
    useBusEvent: {
        <P = unknown>(event: BusEvent, observer: BusEventObserver<P>): void
        <P = unknown>(event: BusEvent, observer: undefined | BusEventObserver<P>): void
    }
}

export interface BusBoundCase2Options {
    context?: undefined | React.Context<undefined | Bus>
    contextName?: undefined | string
}
export interface BusBoundCase2Exports extends BusBoundCase1Exports {
    BusContext: React.Context<undefined | Bus>
    BusProvider: {
        (props: {children: React.ReactNode}): JSX.Element
    },
    useBusContext: {
        (): undefined | Bus
    }
    useBusProvider: {
        (): Bus
    }
}
