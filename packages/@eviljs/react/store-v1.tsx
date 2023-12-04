import type {ReducerState} from '@eviljs/std/redux.js'
import {useContext, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'

export const StoreContextV1 = defineContext<StoreV1<ReducerState>>('StoreContextV1')

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
export function StoreProviderV1(props: StoreProviderV1Props<ReducerState>) {
    const {children, ...spec} = props
    const contextValue = useStoreCreatorV1(spec)

    return <StoreContextV1.Provider value={contextValue} children={children}/>
}

export function useStoreCreatorV1<S extends ReducerState>(spec: StoreDefinitionV1<S>): StoreV1<S> {
    const {createState} = spec

    return useState(createState)
}

export function useStoreV1<S extends ReducerState>(): StoreV1<S> {
    return useContext(StoreContextV1)! as unknown as StoreV1<S>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderV1Props<S extends ReducerState> extends StoreDefinitionV1<S> {
    children: undefined | React.ReactNode
}

export interface StoreDefinitionV1<S extends ReducerState> {
    createState(): S
}

export type StoreV1<S extends ReducerState> = StateManager<S>
