import {createBus, type Bus} from '@eviljs/std/bus.js'
import {useContext, useMemo} from 'react'
import {defineContext} from './ctx.js'

export type {Bus, BusEvent, BusEventObserver, BusEventPayloadOf} from '@eviljs/std/bus.js'

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
    const {bus: busOptional, children, context: contextOptional} = props
    const contextDefault = BusContext as React.Context<undefined | Bus>
    const Context = contextOptional ?? contextDefault

    const contextValue = useMemo(() => {
        return busOptional ?? createBus()
    }, [busOptional])

    return <Context.Provider value={contextValue} children={children}/>
}

export function useBusContext(options?: undefined | BusContextOptions): undefined | Bus {
    const contextDefault = BusContext as React.Context<undefined | Bus>
    const contextValue = useContext(options?.context ?? contextDefault)

    return options?.bus ?? contextValue
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusProviderProps extends BusContextOptions {
    children?: undefined | React.ReactNode
}

export interface BusContextOptions {
    bus?: undefined | Bus
    context?: undefined | React.Context<undefined | Bus>
}
