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
    const value = useRootStore(spec)

    return <StoreContext.Provider value={value} children={children}/>
}

export function useRootStore<S extends StoreStateGeneric>(spec: StoreDefinition<S>): Store<S> {
    const {createState} = spec

    return useState(createState)
}

export function useStore<S extends StoreStateGeneric>() {
    return useContext(StoreContext) as unknown as undefined | Store<S>
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
