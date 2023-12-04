import {actionFromPolymorphicArgs, type ReducerAction, type ReducerArgs, type ReducerId, type ReducerPolymorphicAction, type ReducerState} from '@eviljs/std/redux.js'
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
export function StoreProviderV2(props: StoreProviderV2Props<ReducerState, ReducerAction>) {
    const {children, ...spec} = props
    const contextValue = useCreateStoreV2(spec)

    return <StoreContextV2.Provider value={contextValue} children={children}/>
}

export function useCreateStoreV2<
    S extends ReducerState,
    A extends ReducerAction,
>(spec: StoreDefinitionV2<S, A>): StoreV2<S, A> {
    const {createState, reduce, onDispatch} = spec
    const [state, setState] = useState(createState)
    const stateRef = useRef(state)

    const dispatch = useCallback((...polymorphicArgs: ReducerPolymorphicAction): S => {
        const [id, ...args] = actionFromPolymorphicArgs(...polymorphicArgs)

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
    S extends ReducerState = ReducerState,
    A extends ReducerAction = ReducerAction,
>(): StoreV2<S, A> {
    return useContext(StoreContextV2)! as unknown as StoreV2<S, A>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderV2Props<S extends ReducerState, A extends ReducerAction> extends StoreDefinitionV2<S, A> {
    children: undefined | React.ReactNode
}

export interface StoreDefinitionV2<S extends ReducerState, A extends ReducerAction> {
    createState(): S
    reduce(state: S, ...args: A): S
    onDispatch?: undefined | ((id: ReducerId, args: ReducerArgs, newState: S, oldState: S) => void)
}

export type StoreV2<
    S extends ReducerState = ReducerState,
    A extends ReducerAction = ReducerAction,
> = [S, StoreDispatchV2<S, A>]

export interface StoreDispatchV2<S extends ReducerState, A extends ReducerAction = ReducerAction> {
    (action: A): S
    (...args: A): S
}
