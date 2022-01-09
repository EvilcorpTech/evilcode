import {isArray, isFunction, isObject} from '@eviljs/std/type.js'
import React, {createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react'
import {useRequestRender} from './react.js'
import {useRootStoreStorage as useCoreRootStoreStorage} from './store-storage.js'
import {defaultOnMerge, StoreStorageOptions} from './store-v1.js'
import {Store as StoreV2} from './store-v2.js'

export const StoreContext = createContext<StoreService<any>>(void undefined as any)

StoreContext.displayName = 'StoreContext'

/*
* EXAMPLE
*
* const spec = {createState}
* const Main = WithStore(MyMain, spec)
*
* render(<Main/>, document.body)
*/
export function WithStore<P extends {}, S extends {}>(Child: React.ComponentType<P>, spec: StoreSpec<S>) {
    function StoreProviderProxy(props: P) {
        return withStore(<Child {...props}/>, spec)
    }

    return StoreProviderProxy
}

/*
* EXAMPLE
*
* const spec = {createState}
*
* export function MyMain(props) {
*     return withStore(<Child/>, spec)
* }
*/
export function withStore<S extends {}>(children: React.ReactNode, spec: StoreSpec<S>) {
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
* const spec = {createState}
*
* export function MyMain(props) {
*     return (
*         <StoreProvider spec={spec}>
*             <MyApp/>
*         </StoreProvider>
*     )
* }
*/
export function StoreProvider<S extends {}>(props: StoreProviderProps<S>) {
    return withStore(props.children, props.spec)
}

export function useRootStore<S extends {}>(spec: StoreSpec<S>): StoreService<S> {
    const {createState} = spec
    const stateRef = useRef(createState())
    const soreObservers = useMemo(() =>
        new Map<string, Array<ChangeObserver>>()
    , [])

    const mutate = useCallback((path: ChangePath, value: React.SetStateAction<any>) => {
        mutateState(stateRef, path, value)

        const pathKey = keyForPath(path)
        const observers = soreObservers.get(pathKey)

        if (! observers) {
            const message =
                '@eviljs/react/store:\n'
                + `missing observers for '${JSON.stringify(path)}'.`
            console.warn(message)
            return
        }

        for (const it of observers) {
            it()
        }
    }, [])

    const observe = useCallback((path: ChangePath, observer: ChangeObserver) => {
        const pathKey = keyForPath(path)

        // Optimization.
        // We use Map.get(), instead of Map.has() + Map.get().
        const keyObservers = soreObservers.get(pathKey) ?? (() => {
            const observers: Array<ChangeObserver> = []
            soreObservers.set(pathKey, observers)
            return observers
        })()

        keyObservers.push(observer)

        function stop() {
            const idx = keyObservers.indexOf(observer)

            if (idx < 0) {
                const message =
                    '@eviljs/react/store:\n'
                    + `observer vanished. Was listening on '${JSON.stringify(path)}'.`
                console.warn(message)
                return
            }

            keyObservers.splice(idx, 1)
        }

        return stop
    }, [])

    const store = useMemo(() => {
        return {mutate, observe, stateRef}
    }, [observe])

    return store
}

export function useStore<S extends {}, V>(optionalSelector: StoreSelector<S, V>, deps?: Array<unknown>): Store<V>
export function useStore<S extends {}>(): Store<S>
export function useStore<S extends {}, V>(optionalSelector?: StoreSelector<S, V>, deps?: Array<unknown>): Store<V> {
    const selector = optionalSelector ?? (defaultSelector as StoreSelector<S, V>)
    const store = useContext<StoreService<S>>(StoreContext)
    const state = store.stateRef.current
    const path = useMemo(() => select(state, selector), deps ?? [])
    const requestRender = useRequestRender()

    const selectedState = useMemo((): V => {
        let selectedState: any = state
        for (const it of path) {
            selectedState = selectedState[it]
        }
        return selectedState
    }, [state, path])

    useLayoutEffect(() => {
        const stopObserving = store.observe(path, requestRender)
        return stopObserving
    }, [path])

    const setSelectedState = useCallback((value: React.SetStateAction<V>) => {
        store.mutate(path, value)
    }, [path])

    return [selectedState, setSelectedState]
}

export function useRootStoreStorage<S extends {}, L extends {} = S>(options?: StoreStorageOptions<S, L>) {
    const onLoad = options?.onLoad
    const onMerge = options?.onMerge
    const [state, setState] = useStore<S>()

    useCoreRootStoreStorage<S, L>(state, {
        ...options,
        onLoad(savedState) {
            onLoad?.(savedState)
            setState(state => onMerge?.(savedState, state) ?? defaultOnMerge(savedState, state))
        },
    })
}

export function select<S extends {}, V>(state: S, selector: StoreSelector<S, V>): ChangePath {
    const path: ChangePath = []
    const stateProxy = createProxy(state, onAccess)

    selector(stateProxy)

    function onAccess(key: PropertyKey) {
        path.push(key)
    }

    return path
}

export function defaultSelector<S extends {}>(state: S): S {
    return state
}

export function mutateState(
    stateRef: React.MutableRefObject<any>,
    path: ChangePath,
    value: React.SetStateAction<any>
) {
    if (path.length === 0) {
        stateRef.current = computeValue(value, stateRef.current)
        return
    }

    stateRef.current = cloneShallow(stateRef.current)

    let selectedState = stateRef.current

    let idx = -1
    while (++idx < path.length) {
        if (! selectedState) {
            const message =
                '@eviljs/react/store:\n'
                + `mutated state vanished from '${JSON.stringify(path)}'.`
            console.warn(message)
            return
        }

        const it = path[idx]!

        if (! (it in selectedState)) {
            const message =
                '@eviljs/react/store:\n'
                + `mutated state path vanished from '${JSON.stringify(path)}'.`
            console.warn(message)
            return
        }

        if (idx === path.length - 1) {
            selectedState[it] = computeValue(value, selectedState[it])
        }
        else {
            selectedState[it] = cloneShallow(selectedState[it])
        }
        selectedState = selectedState[it]
    }
}

export function computeValue<S = any>(nextState: React.SetStateAction<S>, prevState: S) {
    return isFunction(nextState)
        ? nextState(prevState)
        : nextState
}

export function createProxy<O extends {}>(state: O, onAccess: (key: PropertyKey) => void) {
    const proxy = new Proxy(state, {
        get(obj, prop, proxy): unknown {
            if (! (prop in obj)) {
                const message =
                    '@eviljs/react/store:\n'
                    + `missing property '${String(prop)}'.`
                console.warn(message)
                return
            }
            if (! hasOwnProperty(obj, prop)) {
                const message =
                    '@eviljs/react/store:\n'
                    + `accessing inherited property '${String(prop)}'.`
                console.warn(message)
                return
            }

            const value = (obj as Record<PropertyKey, any>)[prop]

            onAccess(prop)

            if (isObject(value) || isArray(value)) {
                return createProxy(value, onAccess)
            }

            return value
        },
        // construct() {},
        // has() {},
        // set(obj, prop, val, proxy) {},
        // deleteProperty() {},
        // apply() {},
        // ownKeys() {},
        // defineProperty() {},
        // getOwnPropertyDescriptor() {},
        // getPrototypeOf() {},
        // setPrototypeOf() {},
        // isExtensible() {},
        // preventExtensions() {},
    })

    return proxy
}

export const objectHasOwnProperty = Object.prototype.hasOwnProperty

export function hasOwnProperty(obj: {}, prop: PropertyKey) {
    return objectHasOwnProperty.call(obj, prop)
}

export function cloneShallow<T>(value: T): T {
    if (isArray(value)) {
        return [...value] as unknown as T
    }
    if (isObject(value)) {
        return {...value} as unknown as T
    }
    return value
}

export function keyForPath(path: ChangePath) {
    let id = '/'
    for (const it of path) {
        id += String(it) + '/'
    }
    return id
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends {}> {
    children: React.ReactNode
    spec: StoreSpec<S>
}

export interface StoreSpec<S extends {}> {
    createState(): S
}

export interface StoreService<S extends {}> {
    stateRef: React.MutableRefObject<S>
    observe(path: ChangePath, observer: ChangeObserver): Unobserve
    mutate(path: ChangePath, value: React.SetStateAction<any>): void
}

export interface Store<S> extends StoreV2<S> {
}

export interface StoreSelector<S extends {}, V> {
    (state: S): V
}

export interface ChangePath extends Array<PropertyKey> {
}

export interface ChangeObserver {
    (): void
}

export interface Unobserve {
    (): void
}
