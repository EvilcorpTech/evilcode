import {isFunction, ValueOf} from '@eviljs/std/type.js'
import {createContext, useContext, useMemo, useReducer} from 'react'
import {
    useRootStoreStorage as useCoreRootStoreStorage,
    StoreStorageOptions as CoreStoreStorageOptions,
} from './store-storage.js'

export const StoreV1Context = createContext<unknown>(undefined)
export const StoreSetAction = 'set'
export const StoreResetAction = 'reset'

export const StoreDefaultActions = {
    [StoreSetAction]: setAction,
    [StoreResetAction]: resetAction,
}

StoreV1Context.displayName = 'StoreV1Context'

/*
* EXAMPLE
*
* const spec = {createState, actions}
* const Main = WithStore(MyMain, spec)
*
* render(<Main/>, document.body)
*/
export function WithStore<P extends {}, S extends {}, A extends StoreActions<S>>(Child: React.ComponentType<P>, spec: StoreSpec<S, A>) {
    function StoreV1ProviderProxy(props: P) {
        return withStore(<Child {...props}/>, spec)
    }

    return StoreV1ProviderProxy
}

/*
* EXAMPLE
*
* const spec = {createState, actions}
*
* export function MyMain(props) {
*     return withStore(<Child/>, spec)
* }
*/
export function withStore<S extends {}, A extends StoreActions<S>>(children: React.ReactNode, spec: StoreSpec<S, A>) {
    const store = useRootStore(spec)

    return (
        <StoreV1Context.Provider value={store}>
            {children}
        </StoreV1Context.Provider>
    )
}

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
export function StoreProvider<S extends {}, A extends StoreActions<S>>(props: StoreProviderProps<S, A>) {
    return withStore(props.children, props.spec)
}

export function useRootStore<S extends {}, A extends StoreActions<S>>(spec: StoreSpec<S, A>) {
    const {createState} = spec
    const actions = {
        ...StoreDefaultActions,
        ...spec?.actions,
    }

    function reduce(state: S, action: StoreAction<unknown>) {
        const handler = actions[action.type]

        if (! handler) {
            console.warn(
                '@eviljs/react/store-v1:\n'
                + `missing action '${action.type}'.`
            )
            return state
        }

        return handler(state, action.value);
    }

    const [state, dispatch] = useReducer(reduce, null, createState)

    const store = useMemo(() => {
        function commit(action: StoreAction<unknown>) {
            spec?.listener?.(action, state)

            dispatch(action)
        }

        return {state, commit}
    }, [state])

    return store as Store<S, A>
}

export function useStore<S extends {}, A extends StoreActions<S>>() {
    return useContext<Store<S, A>>(StoreV1Context as React.Context<Store<S, A>>)
}

export function useRootStoreStorage<S extends {}, L extends {} = S>(options?: StoreStorageOptions<S, L>) {
    const onLoad = options?.onLoad
    const onMerge = options?.onMerge
    const {state, commit} = useStore<S, StoreDefaultActions<S>>()

    useCoreRootStoreStorage<S, L>(state, {
        ...options,
        onLoad(savedState) {
            onLoad?.(savedState)
            commit({type: 'reset', value(state) {
                return onMerge?.(savedState, state) ?? defaultOnMerge(savedState, state)
            }})
        },
    })
}

export function setAction<S extends {}>(state: S, value: StoreSetStateAction<S>): S {
    return {
        ...state, // Old state.
        ...isFunction(value)
            ? value(state) // New computed state.
            : value // New provided state.
        ,
    }
}

export function resetAction<S extends {}>(state: S, value: React.SetStateAction<S>): S {
    return (
        isFunction(value)
            ? value(state) // New computed state.
            : value // New provided state.
    )
}

export function defaultOnMerge<S extends {}, L extends {} = S>(savedState: L, state: S): S {
    // Shallow merge.
    // Saved state from LocalStorage overwrites current state.
    return {...state, ...savedState}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends {}, A extends StoreActions<S>> {
    children: React.ReactNode
    spec: StoreSpec<S, A>
}

export interface StoreSpec<S extends {}, A extends StoreActions<S>> {
    actions: A
    createState(): S
    listener?: (action: StoreActionsOf<S, A>, oldState: S) => void
}

export interface Store<S extends {}, A extends StoreActions<S>> {
    state: S
    commit: React.Dispatch<
        | StoreActionsOf<S, StoreDefaultActions<S>>
        | StoreActionsOf<S, A>
    >
}

export interface StoreActions<S extends {}> {
    [key: string]: React.Reducer<S, any>
}

export interface StoreAction<V> {
    type: string
    value: V
}

export type StoreSetStateAction<S extends {}> = Partial<S> | ((prevState: S) => Partial<S>)

export type StoreDefaultActions<S extends {}> = {
    [StoreSetAction](state: S, value: StoreSetStateAction<S>): S
    [StoreResetAction](state: S, value: React.SetStateAction<S>): S
}

export type StoreActionsOf<S extends {}, A extends StoreActions<S>> = ValueOf<{
    [key in keyof A]: {
        type: key
        value: Parameters<A[key]>[1]
    }
}>

export interface StoreStorageOptions<S extends {}, L extends {} = S> extends Partial<CoreStoreStorageOptions<S, L>> {
    onMerge?: undefined | StoreStorageOnLoad<S, L>
}

export interface StoreStorageOnLoad<S extends {}, L extends {} = S> {
    (savedState: L, state: S): S
}
