import type {Io} from '@eviljs/std/fn.js'
import {makeReactive, type ReactiveValue} from '@eviljs/std/reactive.js'
import type {ReducerAction} from '@eviljs/std/redux.js'
import {isArray} from '@eviljs/std/type.js'
import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {defineContext} from './ctx.js'
import {useClosure} from './ref.js'
import type {StoreStateGeneric} from './store-v1.js'
import type {StoreDispatch, StoreDispatchPolymorphicArgs, StoreProviderProps, StoreSpec} from './store-v2.js'
import {defaultSelector, type StoreSelector} from './store-v3.js'

export * from '@eviljs/std/redux.js'

export {patchState} from './store-v2.js'
export type {StoreSpec} from './store-v2.js'

export const StoreContext = defineContext<StoreManager>('StoreContext')

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

export function useRootStore<
    S extends StoreStateGeneric,
    A extends ReducerAction,
>(spec: StoreSpec<S, A>): StoreManager<S, A> {
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

    const store = useMemo((): StoreManager<S, A> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

export function useStoreContext<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>() {
    return useContext(StoreContext) as undefined | StoreManager<S, A>
}

/*
* EXAMPLE
*
* const [books, dispatch] = useStore(state => state.books)
* const [selectedFood, dispatch] = useStore(state => state.food[selectedFoodIndex])
*/
export function useStore<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(): StoreAccessor<S, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(selector: StoreSelector<S, V>): StoreAccessor<V, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(selectorOptional?: undefined | StoreSelector<S, V>): StoreAccessor<V | S, S, A> {
    const selectedState = useStoreState<V, S>(selectorOptional)
    const dispatch = useStoreDispatch<S, A>()

    return [selectedState, dispatch]
}

/*
* EXAMPLE
*
* const storeState = useStoreState()
* const selectedFood = useStoreState(state => state.food[selectedFoodIndex])
*/
export function useStoreState<S extends StoreStateGeneric>(): S
export function useStoreState<V, S extends StoreStateGeneric>(selector: StoreSelector<S, V>): V
export function useStoreState<V, S extends StoreStateGeneric>(selectorOptional?: undefined | StoreSelector<S, V>): V | S
export function useStoreState<V, S extends StoreStateGeneric>(selectorOptional?: undefined | StoreSelector<S, V>): V | S {
    const [state] = useStoreContext<S>()!
    const selector: Io<S, V | S> = selectorOptional ?? defaultSelector
    const selectedState = selector(state.value)
    const [_, setSelectedState] = useState(selectedState)
    const selectorClosure = useClosure(selector)

    useEffect(() => {
        const stopWatching = state.watch((newState, oldState) => {
            setSelectedState(selectorClosure(newState))
        })

        function onClean() {
            stopWatching()
        }

        return onClean
    }, [state])

    return selectedState
}

export function useStoreDispatch<
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
>(): StoreDispatch<S, A> {
    const [state, dispatch] = useStoreContext<S, A>()!
    return dispatch
}

// Types ///////////////////////////////////////////////////////////////////////

export type StoreManager<
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
> = [ReactiveValue<S>, StoreDispatch<S, A>]

export type StoreAccessor<
    V,
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
> = [V, StoreDispatch<S, A>]
