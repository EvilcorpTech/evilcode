import {asReduxEvent, type ReduxEvent, type ReduxEventPolymorphic, type ReduxReducerArgs, type ReduxReducerId, type ReduxReducerState} from '@eviljs/std/redux'
import {useCallback, useContext, useMemo, useRef, useState} from 'react'
import {defineContext} from './ctx.js'

export const StoreContextV2: React.Context<undefined | StoreV2> = defineContext<StoreV2>('StoreContextV2')

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
export function StoreProviderV2(props: StoreProviderV2Props<ReduxReducerState, ReduxEvent>): React.JSX.Element {
    const {children, ...spec} = props
    const contextValue = useStoreV2Provider(spec)

    return <StoreContextV2 value={contextValue} children={children}/>
}

export function useStoreV2Provider<
    S extends ReduxReducerState,
    A extends ReduxEvent,
>(args: StoreDefinitionV2<S, A>): StoreV2<S, A> {
    const {createState, reduce, observer} = args
    const [state, setState] = useState(createState)
    const stateRef = useRef(state)

    const dispatch = useCallback((...polymorphicArgs: ReduxEventPolymorphic): S => {
        const [id, ...args] = asReduxEvent(...polymorphicArgs)

        const oldState = stateRef.current
        const newState = reduce(oldState, ...[id, ...args] as A)

        stateRef.current = newState

        setState(newState)

        observer?.(id, args, newState, oldState)

        return newState
    }, [reduce, observer])

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
    observer?: undefined | StoreV2Observer<S>
}

export type StoreV2<
    S extends ReduxReducerState = ReduxReducerState,
    A extends ReduxEvent = ReduxEvent,
> = [S, StoreDispatchV2<S, A>]

export interface StoreDispatchV2<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent> {
    (action: A): S
    (...args: A): S
}

export type StoreV2Observer<S extends ReduxReducerState> = (id: ReduxReducerId, args: ReduxReducerArgs, newState: S, oldState: S) => void
