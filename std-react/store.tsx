import {error, StdError} from '@eviljs/std-lib/error.js'
import {isFunction} from '@eviljs/std-lib/type.js'
import {ValueOf} from '@eviljs/std-lib/type.js'
import React from 'react'
const {createContext, useContext, useEffect, useRef, useMemo, useReducer} = React

export const StoreContext = createContext<Store<{}, StoreActions<{}>>>(void undefined as any)
export class InvalidAction extends StdError {}
export const StoreSetAction = 'set'
export const StoreResetAction = 'reset'

export const StoreDefaultActions = {
    [StoreSetAction]: setAction,
    [StoreResetAction]: resetAction,
}

StoreContext.displayName = 'StdStoreContext'

/*
* EXAMPLE
*
* const spec = {createState, actions}
* const main = WithStore(MyMain, spec)
*
* render(<main/>, document.body)
*/
export function WithStore<S extends {}, A extends StoreActions<S>>(Child: React.ElementType, spec: StoreSpec<S, A>) {
    function StoreProviderProxy(props: any) {
        return withStore(<Child {...props}/>, spec)
    }

    return StoreProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {createState, actions}
*     const main = withStore(<Main/>, spec)
*
*     return main
* }
*/
export function withStore<S extends {}, A extends StoreActions<S>>(children: React.ReactNode, spec: StoreSpec<S, A>) {
    const store = useRootStore(spec)

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    )
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {createState, actions}
*
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
            return throwInvalidAction(action.type)
        }

        return handler(state, action.value)
    }

    const [state, commit] = useReducer(reduce, null, createState)

    const store = useMemo(() => {
        return {state, commit}
    }, [state, commit])

    return store as Store<S, A>
}

export function useStore<S extends {}, A extends StoreActions<S>>() {
    return useContext(StoreContext) as Store<S, A>
}

export function useStoreStorage<S extends {}, L extends {}>(options?: StoreStorageOptions<S, L>) {
    const {state, commit} = useStore<S, any>()
    const isLoadedRef = useRef(false)
    const version = options?.version ?? 1
    const storageType = options?.storage ?? 'localStorage'
    const onLoad = options?.onLoad ?? defaultOnLoad
    const onLoadMerge = options?.onLoadMerge ?? defaultOnLoadMerge
    const onMissing = options?.onMissing
    const onSave = options?.onSave ?? defaultOnSave
    const storageKey = 'std-store-state-v' + version
    const storage = window[storageType] as undefined | Storage

    function defaultOnLoad(state: S, savedState: L) {
        const mergedState = onLoadMerge(state, savedState)

        commit({type: 'reset', value: mergedState})
    }

    function defaultOnLoadMerge(state: S, savedState: L) {
        // Shallow merge.
        // State from LocalStorage overwrites current state.
        return {...state, ...savedState}
    }

    function defaultOnSave(state: S) {
        return state
    }

    useEffect(() => {
        if (! storage) {
            return
        }

        // We try deriving the state from LocalStorage.
        // We need to derive the state inside an effect instead of inside
        // the render function because we are mutating a different component.
        isLoadedRef.current = true
        // we use a ref avoiding triggering a re-render if not needed.

        const savedState = loadStateFromStorage<L>(storage, storageKey)

        if (! savedState) {
            // We don't have a saved state. We have nothing to do.
            onMissing?.()
            return
        }

        onLoad(state, savedState)
    }, [])

    useEffect(() => {
        if (! storage) {
            return
        }

        if (! isLoadedRef.current) {
            // We can't save the state yet.
            return
        }

        const stateToSave = onSave(state)
        // TODO: add debounce?
        saveStateToStorage(storage, storageKey, stateToSave)
    }, [state])
}

export function setAction<S extends {}>(state: S, value: StoreActionValueComputer<S, Partial<S>>): S {
    return {
        ...state, // Old state.
        ...isFunction(value)
            ? value(state) // New computed state.
            : value // New provided state.
        ,
    }
}

export function resetAction<S extends {}>(state: S, value: StoreActionValueComputer<S, S>): S {
    return (
        isFunction(value)
            ? value(state) // New computed state.
            : value // New provided state.
    )
}

export function saveStateToStorage(storage: Storage, key: string, state: any) {
    if (! state) {
        return
    }

    const serializedState = JSON.stringify(state)

    storage.setItem(key, serializedState)
}

export function loadStateFromStorage<S = unknown>(storage: Storage, key: string) {
    const serializedState = storage.getItem(key)

    if (! serializedState) {
        return
    }

    return JSON.parse(serializedState) as S
}

export function throwInvalidAction(action: string) {
    const message =
        '@eviljs/std-react/store:\n'
        + `missing action '${action}'.`
    return error({type: InvalidAction, message})
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends {}, A extends StoreActions<S>> {
    children: React.ReactNode
    spec: StoreSpec<S, A>
}

export interface StoreSpec<S extends {}, A extends StoreActions<S>> {
    actions: A
    createState(): S
    // TODO: getters, effects, plugs.
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

export type StoreActionValueComputer<S extends {}, V extends {}> = V | ((state: S) => V)

export type StoreDefaultActions<S extends {}> = {
    [StoreSetAction](state: S, value: Partial<S> | ((state: S) => Partial<S>)): S
    [StoreResetAction](state: S, value: S | ((state: S) => S)): S
}

export type StoreActionsOf<S extends {}, A extends StoreActions<S>> = ValueOf<{
    [key in keyof A]: {
        type: key
        value: Parameters<A[key]>[1]
    }
}>

export interface StoreStorageOptions<S extends {}, L extends {}> {
    version?: string | number
    storage?: 'localStorage' | 'sessionStorage'
    onLoad?: StoreStorageSetter<S, L>,
    onLoadMerge?: StoreStorageMerger<S, L>
    onMissing?(): void
    onSave?: StoreStorageFilter<S, L>
}

export interface StoreStorageSetter<S extends {}, L extends {}> {
    (state: S, savedState: L): void
}

export interface StoreStorageMerger<S extends {}, L extends {}> {
    (state: S, savedState: L): S
}

export interface StoreStorageFilter<S extends {}, L extends {} = S> {
    (state: S): L
}
