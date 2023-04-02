import {computeValue} from '@eviljs/std/fn.js'
import {areSameObjectsShallow} from '@eviljs/std/object.js'
import type {Reducer, ReducerAction, ReducerActionsOf, ReducerArgs, ReducerId} from '@eviljs/std/redux.js'
import {isArray, type Partial} from '@eviljs/std/type.js'
import {useCallback, useContext, useMemo, useRef, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StoreStateGeneric} from './store-v1.js'

export {composeReducers, defineReducerAction, withId} from '@eviljs/std/redux.js'
export type {Reducer, ReducerAction, ReducerActionsOf, ReducerArgs, ReducerId} from '@eviljs/std/redux.js'

export const StoreContext = defineContext<Store>('StoreContext')

/*
* EXAMPLE
*
* const spec = {createState, actions}
*
* export function MyMain(props) {
*     return (
*         <StoreProvider spec={spec}>
*             <MyApp/>
*         </StoreProvider>
*     )
* }
*/
export function StoreProvider(props: StoreProviderProps<StoreStateGeneric, ReducerAction>) {
    const {children, ...spec} = props

    return (
        <StoreContext.Provider value={useRootStore(spec)}>
            {children}
        </StoreContext.Provider>
    )
}

export function useRootStore<S extends StoreStateGeneric, A extends ReducerAction>(spec: StoreSpec<S, A>) {
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

        onDispatch?.(id, args)

        const oldState = stateRef.current
        const newState = reduce(oldState, ...[id, ...args] as A)

        stateRef.current = newState

        setState(newState)

        return newState
    }, [reduce, onDispatch])

    const store = useMemo((): Store<S, ReducerActionsOf<(state: S, ...args: A) => S>> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

export function useStore<S extends StoreStateGeneric = StoreStateGeneric, R extends Reducer<S> = Reducer<S>>() {
    return useContext(StoreContext) as undefined | Store<S, ReducerActionsOf<R>>
}

export function patchState<S extends StoreStateGeneric>(state: S, statePatch: StoreStatePatch<S>): S {
    const nextState = computeValue(statePatch, state)

    return areSameObjectsShallow(state, nextState)
        ? state
        : {...state, ...nextState}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric, A extends ReducerAction> extends StoreSpec<S, A> {
    children: undefined | React.ReactNode
}

export interface StoreSpec<S extends StoreStateGeneric, A extends ReducerAction> {
    createState(): S
    reduce(state: S, ...args: A): S
    onDispatch?: undefined | ((id: ReducerId, ...args: ReducerArgs) => void)
}

export type Store<S extends StoreStateGeneric = StoreStateGeneric, A extends ReducerAction = ReducerAction> = [S, StoreDispatch<S, A>]

export interface StoreDispatch<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction> {
    (action: A): S
    (...args: A): S
}

export type StoreDispatchPolymorphicArgs =
    | ReducerAction
    | [ReducerAction]

export type StoreStatePatch<S extends StoreStateGeneric> = Partial<S> | ((prevState: S) => Partial<S>)
