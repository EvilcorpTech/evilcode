import type {Bus} from '@eviljs/std/bus.js'
import {defineContext} from './ctx.js'

export type {Bus, BusEvent, BusEventObserver} from '@eviljs/std/bus.js'

export const BusContext = defineContext<Bus>('BusContext')

/*
* EXAMPLE
*
* const bus = createBus()
*
* return (
*     <BusProvider bus={bus}>
*         <MyApp/>
*     </BusProvider>
* )
*/
export function BusProvider(props: BusProviderProps) {
    const {bus, children, context: contextOptional} = props
    const contextDefault = BusContext as React.Context<undefined | Bus>
    const Context = contextOptional ?? contextDefault

    return <Context.Provider value={bus} children={children}/>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BusProviderProps {
    bus: Bus
    children?: undefined | React.ReactNode
    context?: undefined | React.Context<undefined | Bus>
}
