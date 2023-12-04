import type {Io} from '@eviljs/std/fn.js'
import {createReactiveAccessor, type ReactiveAccessor} from '@eviljs/std/reactive-accessor.js'
import type {ReducerAction} from '@eviljs/std/redux.js'
import {identity} from '@eviljs/std/return.js'
import {useContext, useEffect, useState} from 'react'
import {StoreContext, StoreProvider} from './store-provider.js'
import type {StoreStateGeneric} from './store-v1.js'
import type {StoreDefinition, StoreDispatch} from './store-v2.js'

export * from '@eviljs/std/redux.js'
export {patchState} from './store-v2.js'
export type {StoreDefinition} from './store-v2.js'
export * from './store.js'

export function useStoreContext<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): undefined | StoreManager<S, A> {
    const contextDefault = StoreContext as React.Context<undefined | StoreManager<S, A>>

    return useContext(contextOptional ?? contextDefault)
}

/*
* EXAMPLE
*
* const [books, dispatch] = useStore(state => state.books)
* const [selectedFood, dispatch] = useStore(state => state.food[selectedFoodIndex])
*/
export function useStore<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    selectorOptional?: undefined,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): StoreAccessor<S, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    selector: StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): StoreAccessor<V, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): StoreAccessor<V | S, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): StoreAccessor<V | S, S, A> {
    const dispatch = useStoreDispatch<S, A>(contextOptional)
    const readState = useStoreRead<S>(contextOptional)
    const selectedState = useStoreState<V, S>(selectorOptional, contextOptional)

    return [selectedState, dispatch, readState]
}

/*
* EXAMPLE
* const storeState = useStoreState()
* const selectedFood = useStoreState(state => state.food[selectedFoodIndex])
*/
export function useStoreState<S extends StoreStateGeneric>(
    selectorOptional?: undefined,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): S
export function useStoreState<V, S extends StoreStateGeneric>(
    selector: StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): V
export function useStoreState<V, S extends StoreStateGeneric>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): S | V
export function useStoreState<V, S extends StoreStateGeneric>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): S | V {
    const store = useStoreContext<S>(contextOptional)
    const [state] = store ?? [createReactiveAccessor(undefined as unknown as S)]
    const selector: Io<S, V | S> = selectorOptional ?? identity
    const selectedState = selector(state.read())
    const [signal, setSignal] = useState(selectedState)

    useEffect(() => {
        if (! store) {
            return
        }

        const stopWatching = state.watch(
            (newState, oldState) => setSignal(selector(newState)),
            {immediate: true},
        )

        function onClean() {
            stopWatching()
        }

        return onClean
    }, [state, selector])

    return selectedState
}

export function useStoreDispatch<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): StoreDispatch<S, A> {
    const [state, dispatch] = useStoreContext<S, A>(contextOptional)!

    return dispatch
}

export function useStoreRead<S extends StoreStateGeneric>(
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): StoreReader<S> {
    const [state] = useStoreContext<S>(contextOptional)!

    return state.read
}

/*
* EXAMPLE
*
* interface State {name: string, age: number}
* type Action = ['hello', string] | ['sum', number, number]
*
* const context = defineContext<StoreManager<State, Action>>('ExampleContextName')
* const {useStore, useStoreState, useStoreDispatch} = createStore(context)
*/
export function createStore<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    context: React.Context<undefined | StoreManager<S, A>>,
): StoreBound<S, A> {
    const self: StoreBound<S, A> = {
        StoreProvider(props) {
            return <StoreProvider context={context} {...props}/>
        },
        useStoreContext() {
            return useStoreContext(context)
        },
        useStore<V>(selectorOptional?: undefined | StoreSelector<S, V>) {
            return useStore(selectorOptional, context)
        },
        useStoreState<V>(selectorOptional?: undefined | StoreSelector<S, V>) {
            return useStoreState(selectorOptional, context)
        },
        useStoreRead() {
            return useStoreRead(context)
        },
        useStoreDispatch() {
            return useStoreDispatch(context)
        },
    }
    ;(self.StoreProvider as React.FunctionComponent).displayName = 'StoreProviderFactory'

    return self
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric, A extends ReducerAction> extends StoreDefinition<S, A> {
    children: undefined | React.ReactNode
    context?: undefined | React.Context<undefined | StoreManager<S, A>>
}

export type StoreManager<
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
> = [ReactiveAccessor<S>, StoreDispatch<S, A>]

export type StoreAccessor<
    V,
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
> = [V, StoreDispatch<S, A>, StoreReader<S>]

export type StoreReader<S extends StoreStateGeneric> = ReactiveAccessor<S>['read']
export type StoreSelector<S extends StoreStateGeneric, V> = (state: S) => V

export interface StoreBound<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction> {
    StoreProvider: {
        (props: StoreProviderProps<S, A>): JSX.Element,
    },
    useStoreContext: {
        (): undefined | StoreManager<S, A>
    }
    useStore: {
        (selectorOptional?: undefined): StoreAccessor<S, S, A>
        <V>(selector: StoreSelector<S, V>): StoreAccessor<V, S, A>
    }
    useStoreState: {
        (selectorOptional?: undefined): S
        <V>(selector: StoreSelector<S, V>): V
        <V>(selectorOptional?: undefined | StoreSelector<S, V>): S | V
    }
    useStoreDispatch: {
        (): StoreDispatch<S, A>
    }
    useStoreRead: {
        (): ReactiveAccessor<S>['read']
    }
}
