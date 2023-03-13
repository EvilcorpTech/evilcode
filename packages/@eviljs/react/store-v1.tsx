import type {ReducerState} from '@eviljs/std/redux.js'
import {useContext, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'

export const StoreContext = defineContext<Store<StoreStateGeneric>>('StoreContext')

/*
* EXAMPLE
*
* const spec = {createState}
*
* export function MyMain(props) {
*     return (
*         <StoreProvider spec={spec}>
*             <MyApp/>
*         </StoreProvider>
*     )
* }
*/
export function StoreProvider(props: StoreProviderProps<StoreStateGeneric>) {
    const {children, ...spec} = props

    return (
        <StoreContext.Provider value={useRootStore(spec)}>
            {children}
        </StoreContext.Provider>
    )
}

export function useRootStore<S extends StoreStateGeneric>(spec: StoreSpec<S>): Store<S> {
    const {createState} = spec

    return useState(createState)
}

export function useStore<S extends StoreStateGeneric>() {
    return useContext(StoreContext) as unknown as undefined | Store<S>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric> extends StoreSpec<S> {
    children: undefined | React.ReactNode
}

export interface StoreSpec<S extends StoreStateGeneric> {
    createState(): S
}

export type Store<S extends StoreStateGeneric> = StateManager<S>

export type StoreStateGeneric = ReducerState
