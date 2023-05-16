import type {Io} from '@eviljs/std/fn.js'
import {makeReactive, type ReactiveValue} from '@eviljs/std/reactive.js'
import type {ReducerAction, ReducerActionsOf} from '@eviljs/std/redux.js'
import {isArray} from '@eviljs/std/type.js'
import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {defineContext} from './ctx.js'
import {useClosure} from './ref.js'
import type {StoreStateGeneric} from './store-v1.js'
import type {StoreDispatch, StoreDispatchPolymorphicArgs, StoreProviderProps, StoreSpec} from './store-v2.js'
import {defaultSelector, type StoreSelector} from './store-v3.js'

export {composeReducers, defineReducerAction, withId} from '@eviljs/std/redux.js'
export type {Reducer, ReducerAction, ReducerActionsOf, ReducerArgs, ReducerId} from '@eviljs/std/redux.js'
export {patchState} from './store-v2.js'

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

    const state = useMemo(() => {
        return makeReactive(createState())
    }, [])

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

        const oldState = state.value
        const newState = reduce(oldState, ...[id, ...args] as A)

        state.value = newState

        return newState
    }, [reduce, onDispatch])

    const store = useMemo((): Store<S, ReducerActionsOf<(state: S, ...args: A) => S>> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

export function useStoreContext<S extends StoreStateGeneric>() {
    return useContext(StoreContext) as undefined | Store<S>
}

/*
* EXAMPLE
*
* const [books, dispatch] = useStoreState(state => state.books)
* const [selectedFood, dispatch] = useStoreState(state => state.food[selectedFoodIndex])
*/
export function useStoreState<S extends StoreStateGeneric, V>(selectorOptional: StoreSelector<S, V>): StoreStateSelection<V, S>
export function useStoreState<S extends StoreStateGeneric>(): StoreStateSelection<S, S>
export function useStoreState<S extends StoreStateGeneric, V>(selectorOptional?: undefined | StoreSelector<S, V>): StoreStateSelection<S | V, S> {
    const [state, dispatch] = useStoreContext<S>()!
    const selector: Io<S, S | V> = selectorOptional ?? defaultSelector
    const selectorClosure = useClosure(selector)
    const selectedState = selector(state.value)
    const [_, setSelectedState] = useState(selectedState)

    useEffect(() => {
        const stopWatching = state.watch((newState, oldState) => {
            setSelectedState(selectorClosure(newState))
        })

        function onClean() {
            stopWatching()
        }

        return onClean
    }, [state])

    return [selectedState, dispatch]
}

// Types ///////////////////////////////////////////////////////////////////////

export type Store<S extends StoreStateGeneric = StoreStateGeneric, A extends ReducerAction = ReducerAction> = [ReactiveValue<S>, StoreDispatch<S, A>]
export type StoreStateSelection<V, S extends StoreStateGeneric = StoreStateGeneric, A extends ReducerAction = ReducerAction> = [V, StoreDispatch<S, A>]
