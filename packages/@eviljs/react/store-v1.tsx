import type {ReducerState} from '@eviljs/std/redux.js'
import {useContext, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'

export const StoreContext = defineContext<Store<StoreStateGeneric>>('StoreContext')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <StoreProvider createState={createState}>
*             <MyApp/>
*         </StoreProvider>
*     )
* }
*/
export function StoreProvider(props: StoreProviderProps<StoreStateGeneric>) {
    const {children, ...spec} = props
    const contextValue = useStoreCreator(spec)

    return <StoreContext.Provider value={contextValue} children={children}/>
}

export function useStoreCreator<S extends StoreStateGeneric>(spec: StoreDefinition<S>): Store<S> {
    const {createState} = spec

    return useState(createState)
}

export function useStore<S extends StoreStateGeneric>(): Store<S> {
    return useContext(StoreContext)! as unknown as Store<S>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric> extends StoreDefinition<S> {
    children: undefined | React.ReactNode
}

export interface StoreDefinition<S extends StoreStateGeneric> {
    createState(): S
}

export type Store<S extends StoreStateGeneric> = StateManager<S>

export type StoreStateGeneric = ReducerState
