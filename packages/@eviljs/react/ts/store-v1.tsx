import type {ReduxReducerState} from '@eviljs/std/redux.js'
import {useContext, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'

export const StoreContextV1: React.Context<undefined | StoreV1<ReduxReducerState>> = defineContext<StoreV1<ReduxReducerState>>('StoreContextV1')

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
export function StoreProviderV1(props: StoreProviderV1Props<ReduxReducerState>): JSX.Element {
    const {children, ...spec} = props
    const contextValue = useStoreCreatorV1(spec)

    return <StoreContextV1.Provider value={contextValue} children={children}/>
}

export function useStoreCreatorV1<S extends ReduxReducerState>(spec: StoreDefinitionV1<S>): StoreV1<S> {
    const {createState} = spec

    return useState(createState)
}

export function useStoreV1<S extends ReduxReducerState>(): StoreV1<S> {
    return useContext(StoreContextV1)! as unknown as StoreV1<S>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderV1Props<S extends ReduxReducerState> extends StoreDefinitionV1<S> {
    children: undefined | React.ReactNode
}

export interface StoreDefinitionV1<S extends ReduxReducerState> {
    createState(): S
}

export type StoreV1<S extends ReduxReducerState> = StateManager<S>
