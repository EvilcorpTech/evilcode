import type {ReducerAction, ReducerArgs, ReducerId} from '@eviljs/std/redux.js'
import {isArray} from '@eviljs/std/type.js'
import {useCallback, useContext, useMemo, useRef, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StoreStateGeneric} from './store-v1.js'

export * from '@eviljs/std/redux.js'

export const StoreContext = defineContext<Store>('StoreContext')

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
export function StoreProvider(props: StoreProviderProps<StoreStateGeneric, ReducerAction>) {
    const {children, ...spec} = props
    const value = useRootStore(spec)

    return <StoreContext.Provider value={value} children={children}/>
}

export function useRootStore<
    S extends StoreStateGeneric,
    A extends ReducerAction,
>(spec: StoreDefinition<S, A>): Store<S, A> {
    const {createState, reduce, onDispatch} = spec
    const [state, setState] = useState(createState)
    const stateRef = useRef(state)

    const dispatch = useCallback((...polymorphicArgs: StoreDispatchPolymorphicArgs): S => {
        const [id, ...args] = (() => {
            const [idOrAction] = polymorphicArgs

            if (isArray(idOrAction)) {
                const [id, ...args] = idOrAction
                return [id, ...args] as ReducerAction
            }

            return polymorphicArgs as ReducerAction
        })()

        const oldState = stateRef.current
        const newState = reduce(oldState, ...[id, ...args] as A)

        onDispatch?.(id, args, newState, oldState)

        stateRef.current = newState

        setState(newState)

        return newState
    }, [reduce, onDispatch])

    const store = useMemo((): Store<S, A> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

export function useStore<
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
>() {
    return useContext(StoreContext) as undefined | Store<S, A>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric, A extends ReducerAction> extends StoreDefinition<S, A> {
    children: undefined | React.ReactNode
}

export interface StoreDefinition<S extends StoreStateGeneric, A extends ReducerAction> {
    createState(): S
    reduce(state: S, ...args: A): S
    onDispatch?: undefined | ((id: ReducerId, args: ReducerArgs, newState: S, oldState: S) => void)
}

export type Store<
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
> = [S, StoreDispatch<S, A>]

export interface StoreDispatch<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction> {
    (action: A): S
    (...args: A): S
}

export type StoreDispatchPolymorphicArgs =
    | ReducerAction
    | [ReducerAction]
