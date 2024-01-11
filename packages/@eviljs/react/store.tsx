import type {Io} from '@eviljs/std/fn.js'
import {type ReactiveAccessor} from '@eviljs/std/reactive-accessor.js'
import type {ReducerAction, ReducerState} from '@eviljs/std/redux.js'
import {identity} from '@eviljs/std/return.js'
import {useEffect, useState} from 'react'
import {StoreProvider, useStoreContext, type StoreContextOptions, type StoreManager} from './store-provider.js'
import type {StoreDefinitionV2, StoreDispatchV2} from './store-v2.js'

export * from '@eviljs/std/redux.js'
export * from './store-provider.js'
export type {StoreDefinitionV2 as StoreDefinition} from './store-v2.js'

/*
* EXAMPLE
*
* const [books, dispatch] = useStore(state => state.books)
* const [selectedFood, dispatch] = useStore(state => state.food[selectedFoodIndex])
*/
export function useStore<S extends ReducerState, A extends ReducerAction = ReducerAction>(
    selector?: undefined,
    options?: undefined | StoreContextOptions<S, A>,
): StoreAccessor<S, S, A>
export function useStore<V, S extends ReducerState, A extends ReducerAction = ReducerAction>(
    selector: StoreSelector<S, V>,
    options?: undefined | StoreContextOptions<S, A>,
): StoreAccessor<V, S, A>
export function useStore<V, S extends ReducerState, A extends ReducerAction = ReducerAction>(
    selector?: undefined | StoreSelector<S, V>,
    options?: undefined | StoreContextOptions<S, A>,
): StoreAccessor<V | S, S, A>
export function useStore<V, S extends ReducerState, A extends ReducerAction = ReducerAction>(
    selector?: undefined | StoreSelector<S, V>,
    options?: undefined | StoreContextOptions<S, A>,
): StoreAccessor<V | S, S, A> {
    const dispatch = useStoreDispatch<S, A>(options)
    const readState = useStoreRead<S>(options)
    const selectedState = useStoreState<V, S>(selector, options)

    return [selectedState, dispatch, readState]
}

/*
* EXAMPLE
* const storeState = useStoreState()
* const selectedFood = useStoreState(state => state.food[selectedFoodIndex])
*/
export function useStoreState<S extends ReducerState>(
    selectorOptional?: undefined,
    options?: undefined | StoreContextOptions<S, any>,
): S
export function useStoreState<V, S extends ReducerState>(
    selector: StoreSelector<S, V>,
    options?: undefined | StoreContextOptions<S, any>,
): V
export function useStoreState<V, S extends ReducerState>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    options?: undefined | StoreContextOptions<S, any>,
): S | V
export function useStoreState<V, S extends ReducerState>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    options?: undefined | StoreContextOptions<S, any>,
): S | V {
    const [state] = useStoreContext<S>(options)!
    const selector: Io<S, V | S> = selectorOptional ?? identity
    const selectedState = selector(state.read())
    const [signal, setSignal] = useState(selectedState)

    useEffect(() => {
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

export function useStoreDispatch<S extends ReducerState, A extends ReducerAction = ReducerAction>(
    options?: undefined | StoreContextOptions<S, A>,
): StoreDispatchV2<S, A> {
    const [state, dispatch] = useStoreContext<S, A>(options)!

    return dispatch
}

export function useStoreRead<S extends ReducerState>(options?: undefined | StoreContextOptions<S, any>): StoreReader<S> {
    const [state] = useStoreContext<S>(options)!

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
export function setupStore<S extends ReducerState, A extends ReducerAction = ReducerAction>(
    options?: undefined | StoreContextOptions<S, A>
): StoreBound<S, A> {
    return {
        StoreProvider(props) {
            return (
                <StoreProvider
                    context={options?.context}
                    store={options?.store}
                    {...props}
                />
            )
        },
        useStoreContext() {
            return useStoreContext(options)
        },
        useStore<V>(selector?: undefined | StoreSelector<S, V>) {
            return useStore(selector, options)
        },
        useStoreState<V>(selector?: undefined | StoreSelector<S, V>) {
            return useStoreState(selector, options)
        },
        useStoreRead() {
            return useStoreRead(options)
        },
        useStoreDispatch() {
            return useStoreDispatch(options)
        },
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends ReducerState, A extends ReducerAction> extends StoreDefinitionV2<S, A> {
    children: undefined | React.ReactNode
    context?: undefined | React.Context<undefined | StoreManager<S, A>>
}

export type StoreAccessor<
    V,
    S extends ReducerState = ReducerState,
    A extends ReducerAction = ReducerAction,
> = [V, StoreDispatchV2<S, A>, StoreReader<S>]

export type StoreReader<S extends ReducerState> = ReactiveAccessor<S>['read']
export type StoreSelector<S extends ReducerState, V> = (state: S) => V

export interface StoreBound<S extends ReducerState, A extends ReducerAction = ReducerAction> {
    StoreProvider: {
        (props: StoreProviderProps<S, A>): JSX.Element,
    },
    useStoreContext: {
        (): undefined | StoreManager<S, A>
    }
    useStore: {
        (selector?: undefined): StoreAccessor<S, S, A>
        <V>(selector: StoreSelector<S, V>): StoreAccessor<V, S, A>
    }
    useStoreState: {
        (selector?: undefined): S
        <V>(selector: StoreSelector<S, V>): V
        <V>(selector?: undefined | StoreSelector<S, V>): S | V
    }
    useStoreDispatch: {
        (): StoreDispatchV2<S, A>
    }
    useStoreRead: {
        (): ReactiveAccessor<S>['read']
    }
}
