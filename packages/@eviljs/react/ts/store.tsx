import {identity} from '@eviljs/std/fn-return'
import type {Io} from '@eviljs/std/fn-type'
import {createReactive, readReactive, writeReactive, type ReactiveProtocol} from '@eviljs/std/reactive'
import {asReduxEvent, type ReduxEvent, type ReduxEventPolymorphic, type ReduxReducerState} from '@eviljs/std/redux'
import type {RwSync} from '@eviljs/std/rw'
import {useCallback, useContext, useMemo} from 'react'
import {defineContext} from './ctx.js'
import {useReactiveSelect} from './reactive.js'
import type {StoreDefinitionV2 as StoreDefinition, StoreDispatchV2 as StoreDispatch} from './store-v2.js'

export * from '@eviljs/std/redux'
export type {StoreDefinitionV2 as StoreDefinition, StoreDispatchV2 as StoreDispatch, StoreV2Observer as StoreObserver} from './store-v2.js'

export function setupStore<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    options: StoreBoundCase1Options<S, A>,
): StoreBoundCase1Exports<S, A>
export function setupStore<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    options?: undefined | StoreBoundCase2Options<S, A>,
): StoreBoundCase2Exports<S, A>
export function setupStore<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    options?: undefined | StoreBoundCase1Options<S, A> | StoreBoundCase2Options<S, A>,
): StoreBoundCase1Exports<S, A> | StoreBoundCase2Exports<S, A> {
    if (options && 'store' in options) {
        return setupStoreUsingSingleton(options)
    }
    return setupStoreUsingContext(options)
}

export function setupStoreUsingSingleton<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    options: StoreBoundCase1Options<S, A>,
): StoreBoundCase1Exports<S, A> {
    const {store} = options

    return {
        useStore() {
            return useStore(store)
        },
        useStoreState(selector: any) {
            return useStoreState(store, selector)
        },
        useStoreRead() {
            return useStoreRead(store)
        },
        useStoreDispatch() {
            return useStoreDispatch(store)
        },
    }
}

export function setupStoreUsingContext<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    options?: undefined | StoreBoundCase2Options<S, A>,
): StoreBoundCase2Exports<S, A> {
    const Context = options?.context ?? defineContext<StoreManager<S, A>>(options?.contextName ?? 'StoreContext')

    return {
        StoreContext: Context,
        StoreProvider(props) {
            const {children, ...otherProps} = props

            return (
                <Context.Provider value={useStoreProvider(otherProps)}>
                    {children}
                </Context.Provider>
            )
        },
        useStoreContext() {
            return useContext(Context)
        },
        useStoreProvider: useStoreProvider<S, A>,
        useStore<V>(selector?: undefined | StoreSelector<S, V>) {
            return useStore(useContext(Context)!, selector)
        },
        useStoreState<V>(selector?: undefined | StoreSelector<S, V>) {
            return useStoreState(useContext(Context)!, selector)
        },
        useStoreRead() {
            return useStoreRead(useContext(Context)!)
        },
        useStoreDispatch() {
            return useStoreDispatch(useContext(Context)!)
        },
    }
}

export function useStoreProvider<S extends ReduxReducerState, A extends ReduxEvent>(
    options: StoreDefinition<S, A>,
): StoreManager<S, A> {
    const store = useMemo(() => {
        return createStore(options)
    }, [])

    return store
}

export function createStore<
    S extends ReduxReducerState,
    A extends ReduxEvent,
>(options: StoreDefinition<S, A>): StoreManager<S, A> {
    const {createState, reduce, observer} = options

    const state = createReactive(createState())

    function dispatch(...polymorphicArgs: ReduxEventPolymorphic): S {
        const [id, ...args] = asReduxEvent(...polymorphicArgs)

        const oldState = readReactive(state)
        const newState = reduce(oldState, ...[id, ...args] as A)

        writeReactive(state, newState)

        observer?.(id, args, newState, oldState)

        return newState
    }

    return [state, dispatch]
}

export function useStore<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    store: StoreManager<S, A>,
    selector?: undefined,
): StoreAccessor<S, S, A>
export function useStore<V, S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    store: StoreManager<S, A>,
    selector: StoreSelector<S, V>,
): StoreAccessor<V, S, A>
export function useStore<V, S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    store: StoreManager<S, A>,
    selector?: undefined | StoreSelector<S, V>,
): StoreAccessor<V | S, S, A>
export function useStore<V, S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    store: StoreManager<S, A>,
    selector?: undefined | StoreSelector<S, V>,
): StoreAccessor<V | S, S, A> {
    const dispatch = useStoreDispatch<S, A>(store)
    const readState = useStoreRead<S>(store)
    const selectedState = useStoreState<V, S>(store, selector)

    return [selectedState, dispatch, readState]
}

export function useStoreState<S extends ReduxReducerState>(
    store: StoreManager<S, any>,
    selectorOptional?: undefined,
): S
export function useStoreState<V, S extends ReduxReducerState>(
    store: StoreManager<S, any>,
    selector: StoreSelector<S, V>,
): V
export function useStoreState<V, S extends ReduxReducerState>(
    store: StoreManager<S, any>,
    selectorOptional?: undefined | StoreSelector<S, V>,
): S | V
export function useStoreState<V, S extends ReduxReducerState>(
    store: StoreManager<S, any>,
    selectorOptional?: undefined | StoreSelector<S, V>,
): S | V {
    const [state] = store
    const selector: Io<S, V | S> = selectorOptional ?? identity
    const selectedState = useReactiveSelect(state, selector)

    return selectedState
}

export function useStoreRead<S extends ReduxReducerState>(store: StoreManager<S, any>): StoreReader<S> {
    const [state] = store

    const read = useCallback(() => {
        return readReactive(state)
    }, [state])

    return read
}

export function useStoreDispatch<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent>(
    store: StoreManager<S, A>,
): StoreDispatch<S, A> {
    const [state, dispatch] = store

    return dispatch
}

// Types ///////////////////////////////////////////////////////////////////////

export type StoreManager<
    S extends ReduxReducerState = ReduxReducerState,
    A extends ReduxEvent = ReduxEvent,
> = [ReactiveProtocol<S>, StoreDispatch<S, A>]

export type StoreAccessor<
    V,
    S extends ReduxReducerState = ReduxReducerState,
    A extends ReduxEvent = ReduxEvent,
> = [V, StoreDispatch<S, A>, StoreReader<S>]

export type StoreReader<S extends ReduxReducerState> = RwSync<S>['read']
export type StoreSelector<S extends ReduxReducerState, V> = (state: S) => V

export interface StoreBoundCase1Options<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent> {
    store: StoreManager<S, A>
}
export interface StoreBoundCase1Exports<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent> {
    useStore: {
        (selector?: undefined): StoreAccessor<S, S, A>
        <V>(selector: StoreSelector<S, V>): StoreAccessor<V, S, A>
    }
    useStoreState: {
        (selector?: undefined): S
        <V>(selector: StoreSelector<S, V>): V
        <V>(selector?: undefined | StoreSelector<S, V>): S | V
    }
    useStoreRead: {
        (): RwSync<S>['read']
    }
    useStoreDispatch: {
        (): StoreDispatch<S, A>
    }
}

export interface StoreBoundCase2Options<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent> {
    context?: undefined | React.Context<undefined | StoreManager<S, A>>
    contextName?: undefined | string
}
export interface StoreBoundCase2Exports<S extends ReduxReducerState, A extends ReduxEvent = ReduxEvent> extends StoreBoundCase1Exports<S, A> {
    StoreContext: React.Context<undefined | StoreManager<S, A>>
    StoreProvider: {
        (props: {children: React.ReactNode} & StoreDefinition<S, A>): JSX.Element,
    },
    useStoreContext: {
        (): undefined | StoreManager<S, A>
    }
    useStoreProvider: {
        (options: StoreDefinition<S, A>): StoreManager<S, A>
    }
}
