import {useContext, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'
import type {StoreStateGeneric} from './store-v1.js'

export const StoreV2Context = defineContext<Store<StoreStateGeneric>>('StoreV2Context')

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
        <StoreV2Context.Provider value={useRootStore(spec)}>
            {children}
        </StoreV2Context.Provider>
    )
}

export function useRootStore<S extends StoreStateGeneric>(spec: StoreSpec<S>): Store<S> {
    const {createState} = spec

    return useState(createState)
}

export function useStore<S extends StoreStateGeneric>() {
    return useContext(StoreV2Context) as unknown as undefined | Store<S>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric> extends StoreSpec<S> {
    children: undefined | React.ReactNode
}

export interface StoreSpec<S extends StoreStateGeneric> {
    createState(): S
}

export type Store<S extends StoreStateGeneric> = StateManager<S>
