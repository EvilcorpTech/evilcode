import {compute} from '@eviljs/std/compute.js'
import type {Fn, Task} from '@eviljs/std/fn.js'
import {identity} from '@eviljs/std/return.js'
import {cloneShallow} from '@eviljs/std/struct.js'
import {isArray, isObject} from '@eviljs/std/type.js'
import {useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react'
import {defineContext} from '../ctx.js'
import {useRender} from '../lifecycle.js'
import type {StateManager, StateSetterArg} from '../state.js'
import type {StoreStateGeneric} from '../store-v1.js'
import type {StoreSelector} from '../store.js'

export const StoreContext = defineContext<Store<StoreStateGeneric>>('StoreContext')

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return (
*         <StoreProvider createState={createState}>
*             <MyApp/>
*         </StoreProvider>
*     )
* }
*/
export function StoreProvider(props: StoreProviderProps<StoreStateGeneric>) {
    const {children, ...spec} = props
    const contextValue = useStoreCreator(spec)

    return <StoreContext.Provider value={contextValue} children={children}/>
}

export function useStoreCreator<S extends StoreStateGeneric>(spec: StoreDefinition<S>): Store<S> {
    const {createState, onChange} = spec
    const stateRef = useRef(createState())
    const storeObservers = useMemo(() =>
        new Map<string, Array<Task>>()
    , [])

    const mutate = useCallback((path: StatePath, value: StateSetterArg<unknown>) => {
        const pathKey = asPathKey(path)
        const oldState = stateRef.current

        stateRef.current = mutateState(stateRef.current, path, value)

        onChange?.({
            path,
            pathKey,
            value: selectStateValue(stateRef.current, path),
            valueOld: selectStateValue(oldState, path),
            state: stateRef.current,
            stateOld: oldState,
        })

        const keyObservers = storeObservers.get(pathKey)

        if (! keyObservers) {
            console.warn(
                '@eviljs/react/experimental/store-v4:\n'
                + `missing observers for '${pathKey}'.`
            )
            return
        }

        for (const it of keyObservers) {
            it()
        }
    }, [])

    const observe = useCallback((path: StatePath, observer: Task) => {
        forEachPath(path, pathSegment => {
            const pathKey = asPathKey(pathSegment)
            addToMapList(storeObservers, pathKey, observer)
        })

        function stop() {
            forEachPath(path, pathSegment => {
                const pathKey = asPathKey(pathSegment)
                const keyObservers = storeObservers.get(pathKey)
                const idx = keyObservers?.indexOf(observer) ?? -1

                if (idx < 0) {
                    console.warn(
                        '@eviljs/react/store-v4:\n'
                        + `observer vanished. Was listening on '${JSON.stringify(path)}'.`
                    )
                    return
                }

                keyObservers?.splice(idx, 1)
            })
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

export function useStoreContext<S extends StoreStateGeneric>(): undefined | Store<S> {
    return useContext(StoreContext) as undefined | Store<S>
}

/*
* EXAMPLE
*
* const [books, setBooks] = useStoreState(state => state.books)
* const [selectedFood, setSelectedFood] = useStoreState(state => state.food[selectedFoodIndex])
*/
export function useStoreState<S extends StoreStateGeneric, V>(selectorOptional: StoreSelector<S, V>): StateManager<V>
export function useStoreState<S extends StoreStateGeneric>(): StateManager<S>
export function useStoreState<S extends StoreStateGeneric, V>(selectorOptional?: undefined | StoreSelector<S, V>): StateManager<S | V> {
    const selector = (selectorOptional ?? identity) as StoreSelector<StoreStateGeneric, unknown>
    const store = useStoreContext<S>()!
    const state = store.stateRef.current
    const path = selectStatePath(state, selector)
    const pathKey = asPathKey(path)
    const render = useRender()

    const selectedState = useMemo((): V => {
        return selectStateValue(state, path) as V
    }, [state, pathKey])

    useLayoutEffect(() => {
        const stopObserving = store.observe(path, render)
        return stopObserving
    }, [pathKey])

    const setSelectedState = useCallback((value: StateSetterArg<S | V>) => {
        store.mutate(path, value)
    }, [pathKey])

    return [selectedState, setSelectedState]
}

export function selectStatePath(state: StoreStateGeneric, selector: StoreSelector<StoreStateGeneric, unknown>): StatePath {
    const path: StatePath = ['/']

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

    // First path item is '/', the root state.
    for (const it of path.slice(1)) {
        selectedState = selectedState[it]
    }

    return selectedState
}

export function mutateState<S extends StoreStateGeneric = StoreStateGeneric>(
    state: S,
    path: StatePath,
    nextValue: StateSetterArg<unknown>
): S {
    if (path.length === 1) {
        // We are mutating the state root.
        return compute(nextValue, state) as S
    }

    const nextState: any = cloneShallow(state)

    walkState(state, path, (state, key, currentValue, info) => {
        if (key === '/') {
            return
        }

        nextState[key] = ! info.leaf
            // We are traversing the path. We shallow clone all structures on this path.
            ? cloneShallow(currentValue)
            // We reached the end of the path. Time to compute the state value.
            : compute(nextValue, currentValue)
    })

    return nextState
}

export function walkState(
    state: any,
    path: StatePath,
    onNode: (state: any, key: PropertyKey, value: any, info: {leaf: boolean}) => void,
) {
    let stateHead: any = state
    let pathIndex = 0

    while (pathIndex < path.length) {
        const key = path[pathIndex]!
        const value = key === '/'
            ? stateHead
            : stateHead[key]
        const leaf = pathIndex === path.length - 1

        onNode(stateHead, key, value, {leaf})

        pathIndex += 1 // We move the pointers.

        // onNode() can mutate in place, so this operations must be done after the onNode() completion.
        stateHead = key === '/'
            ? stateHead
            : stateHead[key]

        if (! stateHead) {
            console.warn(
                '@eviljs/react/store-v4.walkState():\n'
                + `state vanished from path '${JSON.stringify(path)}'.`
            )
            break
        }
    }
}

export function createStateProxy<S extends StoreStateGeneric>(state: S, onGet: (key: PropertyKey) => void) {
    const proxy = new Proxy(state, {
        get(obj, prop, proxy): unknown {
            onGet(prop)

            if (! (prop in obj)) {
                return
            }
            // if (! hasOwnProperty(obj, prop)) {
            //     console.warn(
            //         '@eviljs/react/store-v4:\n'
            //         + `accessing inherited property '${String(prop)}'.`
            //     )
            //     return
            // }

            const value = (obj as Record<PropertyKey, any>)[prop]

            return isObject(value) || isArray(value)
                ? createStateProxy(value, onGet)
                : value
        },
    })

    return proxy
}

export function asPathKey(path: StatePath) {
    return '/' + path.slice(1).map(it => String(it).replaceAll('/', '_')).join('/')
}

export function forEachPath(path: StatePath, fn: Fn<[StatePath], unknown>) {
    for (let idx = 0, pathSize = path.length; idx < pathSize; ++idx) {
        const pathSegment = path.slice(0, idx + 1)
        fn(pathSegment)
    }
}

export function addToMapList<K extends PropertyKey, I>(map: Map<K, Array<I>>, key: K, item: I): Array<I> {
    // Optimization.
    // We use Map.get(), instead of Map.has() + Map.get().
    const items = map.get(key) ?? (() => {
        const items: Array<I> = []
        map.set(key, items)
        return items
    })()

    items.push(item)

    return items
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric> extends StoreDefinition<S> {
    children: undefined | React.ReactNode
}

export interface StoreDefinition<S extends StoreStateGeneric> {
    createState(): S
    onChange?: undefined | ((args: OnChangeEventArgs) => void)
}

export interface Store<S extends StoreStateGeneric> {
    stateRef: React.MutableRefObject<S>
    state(): S
    observe(path: StatePath, observer: Task): Task
    mutate<V>(path: StatePath, value: StateSetterArg<V>): void
}

export type StatePath = Array<PropertyKey>


export interface OnChangeEventArgs<S extends StoreStateGeneric = StoreStateGeneric> {
    state: S,
    stateOld: S
    path: StatePath,
    pathKey: string,
    value: any,
    valueOld: any,
}
