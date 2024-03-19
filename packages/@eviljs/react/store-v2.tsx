import {asReduxEvent, type ReduxEvent, type ReduxEventPolymorphic, type ReduxReducerArgs, type ReduxReducerId, type ReduxReducerState} from '@eviljs/std/redux.js'
import {useCallback, useContext, useMemo, useRef, useState} from 'react'
import {defineContext} from './ctx.js'

export const StoreContextV2 = defineContext<StoreV2>('StoreContextV2')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <StoreProvider createState={createState} reduce={reduce}>
*             <MyApp/>
*         </StoreProvider>
*     )
* }
*/
export function StoreProviderV2(props: StoreProviderV2Props<ReduxReducerState, ReduxEvent>) {
    const {children, ...spec} = props
    const contextValue = useStoreV2Provider(spec)

    return <StoreContextV2.Provider value={contextValue} children={children}/>
}

export function useStoreV2Provider<
    S extends ReduxReducerState,
    A extends ReduxEvent,
>(args: StoreDefinitionV2<S, A>): StoreV2<S, A> {
    const {createState, reduce, onDispatch} = args
    const [state, setState] = useState(createState)
    const stateRef = useRef(state)

    const dispatch = useCallback((...polymorphicArgs: ReduxEventPolymorphic): S => {
        const [id, ...args] = asReduxEvent(...polymorphicArgs)

        const oldState = stateRef.current
        const newState = reduce(oldState, ...[id, ...args] as A)

        onDispatch?.(id, args, newState, oldState)

        stateRef.current = newState

        setState(newState)

        return newState
    }, [reduce, onDispatch])

    const store = useMemo((): StoreV2<S, A> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

export function useStoreV2<
    S extends ReduxReducerState = ReduxReducerState,
    A extends ReduxEvent = ReduxEvent,
>(): StoreV2<S, A> {
    return useContext(StoreContextV2)! as unknown as StoreV2<S, A>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderV2Props<S extends ReduxReducerState, A extends ReduxEvent> extends StoreDefinitionV2<S, A> {
    children: undefined | React.ReactNode
}

export interface StoreDefinitionV2<S extends ReduxReducerState, A extends ReduxEvent> {
    createState(): S
    reduce(state: S, ...args: A): S
    onDispatch?: undefined | ((id: ReduxReducerId, args: ReduxReducerArgs, newState: S, oldState: S) => void)
}

export type StoreV2<
    S extends ReduxReducerState = ReduxReducerState,
    A extends ReduxEvent = ReduxEvent,
> = [S, StoreDispatchV2<S, A>]

export interface StoreDispatchV2<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent> {
    (action: A): S
    (...args: A): S
}
