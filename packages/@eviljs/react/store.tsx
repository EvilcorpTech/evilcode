import {computeValue} from '@eviljs/std/fn.js'
import {isArray, isObject} from '@eviljs/std/type.js'
import {useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react'
import {defineContext} from './ctx.js'
import {useRender} from './lifecycle.js'
import type {StateManager} from './state.js'

export const StoreContext = defineContext<Store<StoreStateGeneric>>('StoreContext')

/*
* EXAMPLE
*
* const spec = {createState}
* const Main = WithStore(MyMain, spec)
*
* render(<Main/>, document.body)
*/
export function WithStore<P extends {}>(Child: React.ComponentType<P>, spec: StoreSpec<StoreStateGeneric>) {
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
export function withStore(children: React.ReactNode, spec: StoreSpec<StoreStateGeneric>) {
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
export function StoreProvider(props: StoreProviderProps<StoreStateGeneric>) {
    return withStore(props.children, props.spec)
}

export function useRootStore<S extends StoreStateGeneric>(spec: StoreSpec<S>): Store<S> {
    const {createState} = spec
    const stateRef = useRef(createState())
    const storeObservers = useMemo(() =>
        new Map<string, Array<ChangeObserver>>()
    , [])

    const mutate = useCallback((path: StatePath, value: React.SetStateAction<unknown>) => {
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

export function useStoreContext<S extends StoreStateGeneric>() {
    return useContext(StoreContext) as undefined | Store<S>
}

/*
* EXAMPLE
*
* const [books, setBooks] = useStoreState(state => state.books)
* const [selectedFoodIndex, setSelectedFoodIndex] = useStoreState(state => state.selectedFoodIndex)
* const [selectedFood, setSelectedFood] = useStoreState(state => state.food[selectedFoodIndex], [selectedFoodIndex])
*/
export function useStoreState<S extends StoreStateGeneric, V>(selectorOptional: StoreSelector<S, V>, deps?: undefined | Array<unknown>): StateManager<V>
export function useStoreState<S extends StoreStateGeneric>(): StateManager<S>
export function useStoreState<S extends StoreStateGeneric, V>(selectorOptional?: undefined | StoreSelector<S, V>, deps?: undefined | Array<unknown>): StateManager<V> {
    const selector = (selectorOptional ?? defaultSelector) as StoreSelector<StoreStateGeneric, unknown>
    const store = useStoreContext<S>()!
    const state = store.stateRef.current
    const path = useMemo(() => selectPath(state, selector), deps ?? [])
    const render = useRender()

    const selectedState = useMemo((): V => {
        return selectStateValue(state, path) as V
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

export function selectPath(state: StoreStateGeneric, selector: StoreSelector<StoreStateGeneric, unknown>): StatePath {
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

export function selectStateValue<S>(state: S, path: StatePath): unknown {
    let selectedState: any = state

    for (const it of path) {
        selectedState = selectedState[it]
    }

    return selectedState
}

export function defaultSelector<S>(state: S): S {
    return state
}

export function mutateState<S extends StoreStateGeneric = StoreStateGeneric>(
    state: S,
    path: StatePath,
    value: React.SetStateAction<unknown>
): S {
    if (path.length === 0) {
        // We are mutating the state root.
        return computeValue(value, state) as S
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

export function createStateProxy<O extends StoreStateGeneric | Array<unknown>>(state: O, onGet: (key: PropertyKey) => void) {
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

export interface StoreProviderProps<S extends StoreStateGeneric> {
    children: React.ReactNode
    spec: StoreSpec<S>
}

export interface StoreSpec<S extends StoreStateGeneric> {
    createState(): S
}

export interface Store<S extends StoreStateGeneric> {
    stateRef: React.MutableRefObject<S>
    state(): S
    observe(path: StatePath, observer: ChangeObserver): Unobserve
    mutate<V>(path: StatePath, value: React.SetStateAction<V>): void
}

export type StoreStateGeneric = {} | Array<unknown>
export type StatePath = Array<PropertyKey>

export interface StoreSelector<S extends StoreStateGeneric, V> {
    (state: S): V
}

export interface ChangeObserver {
    (): void
}

export interface Unobserve {
    (): void
}
