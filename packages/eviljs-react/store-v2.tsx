import {createContext, useContext, useState} from 'react'
import {useRootStoreStorage as useCoreRootStoreStorage} from './store-storage.js'
import {defaultOnLoad, StoreStorageOptions} from './store-v1.js'

export const StoreV2Context = createContext<Store<any>>(void undefined as any)

StoreV2Context.displayName = 'StoreV2Context'

/*
* EXAMPLE
*
* const spec = {createState, actions}
* const Main = WithStore(MyMain, spec)
*
* render(<Main/>, document.body)
*/
export function WithStore<P extends {}, S>(Child: React.ComponentType<P>, spec: StoreSpec<S>) {
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
export function withStore<S>(children: React.ReactNode, spec: StoreSpec<S>) {
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
export function StoreProvider<S>(props: StoreProviderProps<S>) {
    return withStore(props.children, props.spec)
}

export function useRootStore<S>(spec: StoreSpec<S>): Store<S> {
    const {createState} = spec

    return useState(createState)
}

export function useRootStoreStorage<S extends {}, L extends {} = S>(options?: StoreStorageOptions<S, L>) {
    const onLoad = options?.onLoad
    const [state, setState] = useStore<S>()

    useCoreRootStoreStorage<S, L>(state, {
        ...options,
        onLoad(savedState, state) {
            const mergedState = onLoad?.(savedState, state) ?? defaultOnLoad(savedState, state)

            setState(mergedState)
        },
    })
}

export function useStore<S>() {
    return useContext(StoreV2Context) as Store<S>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S> {
    children: React.ReactNode
    spec: StoreSpec<S>
}

export interface StoreSpec<S> {
    createState(): S
}

export type Store<S> = [S, React.Dispatch<React.SetStateAction<S>>]
