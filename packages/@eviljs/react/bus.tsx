import type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'
import {createBus as createStdBus} from '@eviljs/std/bus.js'
import type {TaskVoid} from '@eviljs/std/fn.js'
import {useCallback, useContext, useEffect, useMemo} from 'react'
import {defineContext} from './ctx.js'

export type {Bus} from '@eviljs/std/bus.js'

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
export function BusProvider<B extends Bus = Bus>(props: BusProviderProps<B>) {
    const {children, context: contextOptional} = props
    const contextDefault = BusContext as React.Context<undefined | B>
    const Context = contextOptional ?? contextDefault

    const value = useMemo(() => createStdBus() as B, [])

    return <Context.Provider value={value} children={children}/>
}

export function useBus<B extends Bus = Bus>(
    contextOptional?: undefined | React.Context<undefined | B>,
): undefined | B {
    const contextDefault = BusContext as React.Context<undefined | B>

    return useContext(contextOptional ?? contextDefault)
}

export function useBusEvent<B extends Bus = Bus>(
    event: BusEvent,
    observer: undefined | BusEventObserver,
    contextOptional?: undefined | React.Context<undefined | B>,
) {
    const bus = useBus(contextOptional)

    useEffect(() => {
        if (! observer) {
            return
        }

        const unobserve = bus?.observe(event, observer)

        function onClean() {
            unobserve?.()
        }

        return onClean
    }, [bus, event, observer])
}

export function createBus<B extends Bus = Bus>(
    context: React.Context<undefined | B>,
): BusBound<B> {
    const self: BusBound<B> = {
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

export interface BusProviderProps<B extends Bus = Bus> {
    children?: undefined | React.ReactNode
    context?: undefined | React.Context<undefined | B>
}

export interface BusBound<B extends Bus> {
    BusProvider: {
        (props: BusProviderProps<B>): JSX.Element,
    },
    useBus: {
        (): undefined | B
    }
    useBusEvent: {
        (event: BusEvent, observer: undefined | BusEventObserver): void
    }
}
