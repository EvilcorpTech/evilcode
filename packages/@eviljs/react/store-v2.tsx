import {useContext, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'
import type {StoreStateGeneric} from './store-v1.js'

export const StoreV2Context = defineContext<Store<StoreStateGeneric>>('StoreV2Context')

/*
* EXAMPLE
*
* const spec = {createState, actions}
* const Main = WithStore(MyMain, spec)
*
* render(<Main/>, document.body)
*/
export function WithStore<P extends {}>(Child: React.ComponentType<P>, spec: StoreSpec<StoreStateGeneric>) {
    function StoreV2ProviderProxy(props: P) {
        return withStore(<Child {...props}/>, spec)
    }

    return StoreV2ProviderProxy
}

/*
* EXAMPLE
*
* const spec = {createState, actions}
*
* export function MyMain(props) {
*     return withStore(<Child/>, spec)
* }
*/
export function withStore(children: React.ReactNode, spec: StoreSpec<StoreStateGeneric>) {
    const store = useRootStore(spec)

    return (
        <StoreV2Context.Provider value={store}>
            {children}
        </StoreV2Context.Provider>
    )
}

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
    return withStore(props.children, props.spec)
}

export function useRootStore<S extends StoreStateGeneric>(spec: StoreSpec<S>): Store<S> {
    const {createState} = spec

    return useState(createState)
}

export function useStore<S extends StoreStateGeneric>() {
    return useContext(StoreV2Context) as unknown as undefined | Store<S>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric> {
    children: React.ReactNode
    spec: StoreSpec<S>
}

export interface StoreSpec<S extends StoreStateGeneric> {
    createState(): S
}

export type Store<S extends StoreStateGeneric> = StateManager<S>
