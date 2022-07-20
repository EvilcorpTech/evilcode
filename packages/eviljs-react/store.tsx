import {computeValue} from '@eviljs/std/fn.js'
import {isArray, isObject} from '@eviljs/std/type.js'
import {createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react'
import {useRender} from './hook.js'
import {useRootStoreStorage as useCoreRootStoreStorage} from './store-storage.js'
import {defaultOnMerge, StoreStorageOptions} from './store-v1.js'
import type {Store as StoreV2} from './store-v2.js'

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
export function WithStore<P extends {}, S>(Child: React.ComponentType<P>, spec: StoreSpec<S>) {
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
export function withStore<S>(children: React.ReactNode, spec: StoreSpec<S>) {
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
export function StoreProvider<S>(props: StoreProviderProps<S>) {
    return withStore(props.children, props.spec)
}

export function useRootStore<S>(spec: StoreSpec<S>): StoreService<S> {
    const {createState} = spec
    const stateRef = useRef(createState())
    const storeObservers = useMemo(() =>
        new Map<string, Array<ChangeObserver>>()
    , [])

    const mutate = useCallback((path: StatePath, value: React.SetStateAction<any>) => {
        const nextState = mutateState(stateRef.current, path, value)
        stateRef.current = nextState

        const pathId = asPathId(path)
        const observers = storeObservers.get(pathId)

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

    const observe = useCallback((path: StatePath, observer: ChangeObserver) => {
        const pathId = asPathId(path)

        // Optimization.
        // We use Map.get(), instead of Map.has() + Map.get().
        const keyObservers = storeObservers.get(pathId) ?? (() => {
            const observers: Array<ChangeObserver> = []
            storeObservers.set(pathId, observers)
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

    const state = useCallback(() => {
        return stateRef.current
    }, [])

    const store = useMemo(() => {
        return {mutate, observe, state, stateRef}
    }, [mutate, observe, state])

    return store
}

export function useStoreContext<S>() {
    return useContext<StoreService<S>>(StoreContext)
}

/*
* EXAMPLE
*
* const [books, setBooks] = useStore(state => state.books)
* const [selectedFoodIndex, setSelectedFoodIndex] = useStore(state => state.selectedFoodIndex)
* const [selectedFood, setSelectedFood] = useStore(state => state.food[selectedFoodIndex], [selectedFoodIndex])
*/
export function useStore<S, V>(optionalSelector: StoreSelector<S, V>, deps?: Array<unknown>): Store<V>
export function useStore<S>(): Store<S>
export function useStore<S, V>(optionalSelector?: StoreSelector<S, V>, deps?: Array<unknown>): Store<V> {
    const selector = optionalSelector ?? (defaultSelector as StoreSelector<S, V>)
    const store = useStoreContext<S>()
    const state = store.stateRef.current
    const path = useMemo(() => selectPath(state, selector), deps ?? [])
    const render = useRender()

    const selectedState = useMemo((): V => {
        return selectStateValue(state, path)
    }, [state, path])

    useLayoutEffect(() => {
        const stopObserving = store.observe(path, render)
        return stopObserving
    }, [path])

    const setSelectedState = useCallback((value: React.SetStateAction<V>) => {
        store.mutate(path, value)
    }, [path])

    return [selectedState, setSelectedState]
}

export function useRootStoreStorage<S, L = S>(options?: StoreStorageOptions<S, L>) {
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

export function selectPath<S, V>(state: S, selector: StoreSelector<S, V>): StatePath {
    const path: StatePath = []

    if (! isObject(state) && ! isArray(state)) {
        // A number or a string.
        return path
    }

    function onGet(key: PropertyKey) {
        path.push(key)
    }

    const stateProxy = createStateProxy(state, onGet)

    selector(stateProxy)

    return path
}

export function selectStateValue<S>(state: S, path: StatePath) {
    let selectedState: any = state

    for (const it of path) {
        selectedState = selectedState[it]
    }

    return selectedState
}

export function defaultSelector<S>(state: S): S {
    return state
}

export function mutateState<S = {}>(
    state: S,
    path: StatePath,
    value: React.SetStateAction<S>
): S {
    if (path.length === 0) {
        // We are mutating the state root.
        return computeValue(value, state)
    }

    const nextState = cloneShallow(state)

    let stateHead: any = nextState
    let pathIndex = -1

    while (++pathIndex < path.length) {
        if (! stateHead) {
            const message =
                '@eviljs/react/store:\n'
                + `mutated state vanished from '${JSON.stringify(path)}'.`
            console.warn(message)
            break
        }

        const stateKey = path[pathIndex]!

        if (! (stateKey in stateHead)) {
            const message =
                '@eviljs/react/store:\n'
                + `mutated state path vanished from '${JSON.stringify(path)}'.`
            console.warn(message)
            break
        }

        const prevValue = stateHead[stateKey]

        if (pathIndex === path.length - 1) {
            // We reached the end of the path. Time to compute the state value.
            stateHead[stateKey] = computeValue(value, prevValue)
        }
        else {
            // We are traversing the path. We shallow clone all structures on this path.
            stateHead[stateKey] = cloneShallow(prevValue)
        }
        // We move the state head pointer.
        stateHead = stateHead[stateKey]
    }

    return nextState
}

export function createStateProxy<O extends {}>(state: O, onGet: (key: PropertyKey) => void) {
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

            onGet(prop)

            if (isObject(value) || isArray(value)) {
                return createStateProxy(value, onGet)
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

export function asPathId(path: StatePath) {
    let id = '/'
    for (const it of path) {
        id += String(it) + '/'
    }
    return id
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S> {
    children: React.ReactNode
    spec: StoreSpec<S>
}

export interface StoreSpec<S> {
    createState(): S
}

export interface StoreService<S> {
    stateRef: React.MutableRefObject<S>
    state(): S
    observe(path: StatePath, observer: ChangeObserver): Unobserve
    mutate<V>(path: StatePath, value: React.SetStateAction<V>): void
}

export interface Store<S> extends StoreV2<S> {
}

export interface StoreSelector<S, V> {
    (state: S): V
}

export interface StatePath extends Array<PropertyKey> {
}

export interface ChangeObserver {
    (): void
}

export interface Unobserve {
    (): void
}
