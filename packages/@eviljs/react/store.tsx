import {identity, type Io} from '@eviljs/std/fn.js'
import {makeReactive, type ReactiveValue} from '@eviljs/std/reactive.js'
import type {ReducerAction} from '@eviljs/std/redux.js'
import {isArray} from '@eviljs/std/type.js'
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {defineContext} from './ctx.js'
import type {StoreStateGeneric} from './store-v1.js'
import type {StoreDefinition, StoreDispatch, StoreDispatchPolymorphicArgs} from './store-v2.js'

export * from '@eviljs/std/redux.js'

export {patchState} from './store-v2.js'
export type {StoreDefinition} from './store-v2.js'

export const StoreContext = defineContext<StoreManager>('StoreContext')

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
export function StoreProvider<S extends StoreStateGeneric, A extends ReducerAction>(props: StoreProviderProps<S, A>) {
    const {children, context, ...spec} = props
    const contextDefault = StoreContext as React.Context<undefined | StoreManager<S, A>>
    const Context = context ?? contextDefault
    const value = useRootStore(spec)

    return <Context.Provider value={value} children={children}/>
}

export function useRootStore<
    S extends StoreStateGeneric,
    A extends ReducerAction,
>(spec: StoreDefinition<S, A>): StoreManager<S, A> {
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

        const oldState = state.read()
        const newState = reduce(oldState, ...[id, ...args] as A)

        onDispatch?.(id, args, newState, oldState)

        state.write(newState)

        return newState
    }, [reduce, onDispatch])

    const store = useMemo((): StoreManager<S, A> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

export function useStoreContext<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
) {
    const contextDefault = StoreContext as React.Context<undefined | StoreManager<S, A>>

    return useContext(contextOptional ?? contextDefault) as undefined | StoreManager<S, A>
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
): undefined | StoreAccessor<S, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    selector: StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): undefined | StoreAccessor<V, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): undefined | StoreAccessor<V | S, S, A>
export function useStore<V, S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): undefined | StoreAccessor<V | S, S, A> {
    const selectedState = useStoreState<V, S>(selectorOptional, contextOptional)
    const dispatch = useStoreDispatch<S, A>(contextOptional)

    if (! selectedState || ! dispatch) {
        return
    }

    const [selectedStateNew, selectedStateOld] = selectedState

    return [selectedStateNew, dispatch]
}

/*
* EXAMPLE
* const storeState = useStoreState()
* const selectedFood = useStoreState(state => state.food[selectedFoodIndex])
*/
export function useStoreState<S extends StoreStateGeneric>(
    selectorOptional?: undefined,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): undefined | [S, S]
export function useStoreState<V, S extends StoreStateGeneric>(
    selector: StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): undefined | [V, V]
export function useStoreState<V, S extends StoreStateGeneric>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): undefined | [V | S, V | S]
export function useStoreState<V, S extends StoreStateGeneric>(
    selectorOptional?: undefined | StoreSelector<S, V>,
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, any>>,
): undefined | [V | S, V | S] {
    const store = useStoreContext<S>(contextOptional)
    const [state] = store ?? [makeReactive(undefined as unknown as S)]
    const selector: Io<S, V | S> = selectorOptional ?? identity
    const selectedState = selector(state.read())
    const selectedStateOld = useRef(selectedState)
    const [_, setSelectedState] = useState(selectedState)

    useEffect(() => {
        setSelectedState(selector(state.read()))

        const stopWatching = state.watch((newState, oldState) => {
            selectedStateOld.current = selector(oldState)
            setSelectedState(selector(newState))
        })

        function onClean() {
            stopWatching()
        }

        return onClean
    }, [state, selector])

    if (! store) {
        return
    }

    return [selectedState, selectedStateOld.current]
}

export function useStoreDispatch<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction>(
    contextOptional?: undefined | React.Context<undefined | StoreManager<S, A>>,
): undefined | StoreDispatch<S, A> {
    const [state, dispatch] = useStoreContext<S, A>(contextOptional) ?? []
    return dispatch
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
        useStore<V>(selectorOptional?: undefined | StoreSelector<S, V>) {
            return useStore(selectorOptional, context)
        },
        useStoreState<V>(selectorOptional?: undefined | StoreSelector<S, V>) {
            return useStoreState(selectorOptional, context)
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
> = [ReactiveValue<S>, StoreDispatch<S, A>]

export type StoreAccessor<
    V,
    S extends StoreStateGeneric = StoreStateGeneric,
    A extends ReducerAction = ReducerAction,
> = [V, StoreDispatch<S, A>]

export interface StoreSelector<S extends StoreStateGeneric, V> {
    (state: S): V
}

export interface StoreBound<S extends StoreStateGeneric, A extends ReducerAction = ReducerAction> {
    StoreProvider: {
        (props: StoreProviderProps<S, A>): JSX.Element,
    },
    useStore: {
        (selectorOptional?: undefined): undefined | StoreAccessor<S, S, A>
        <V>(selector: StoreSelector<S, V>): undefined | StoreAccessor<V, S, A>
    }
    useStoreState: {
        (selectorOptional?: undefined): undefined | [S, S]
        <V>(selector: StoreSelector<S, V>): undefined | [V, V]
        <V>(selectorOptional?: undefined | StoreSelector<S, V>): undefined | [V | S, V | S]
    }
    useStoreDispatch: {
        (): undefined | StoreDispatch<S, A>
    }
}
