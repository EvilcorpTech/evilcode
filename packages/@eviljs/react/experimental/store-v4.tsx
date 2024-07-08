import {compute} from '@eviljs/std/fn-compute.js'
import {identity} from '@eviljs/std/fn-return.js'
import type {Fn, Task} from '@eviljs/std/fn-type.js'
import type {ReduxReducerState} from '@eviljs/std/redux.js'
import {cloneShallow} from '@eviljs/std/struct.js'
import {isArray, isObject} from '@eviljs/std/type-is.js'
import {useCallback, useContext, useLayoutEffect, useMemo, useRef} from 'react'
import {defineContext} from '../ctx.js'
import {useRender} from '../render.js'
import type {StateManager, StateSetterArg} from '../state.js'
import type {StoreSelector} from '../store.js'

export const StoreContextV4: React.Context<undefined | Store<ReduxReducerState>> = defineContext<Store<ReduxReducerState>>('StoreContextV4')

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
export function StoreProviderV4(props: StoreProviderV4Props<ReduxReducerState>): JSX.Element {
    const {children, ...spec} = props
    const contextValue = useStoreV4Provider(spec)

    return <StoreContextV4.Provider value={contextValue} children={children}/>
}

export function useStoreV4Provider<S extends ReduxReducerState>(args: StoreDefinition<S>): Store<S> {
    const {createState, onChange} = args
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

export function useStoreContextV4<S extends ReduxReducerState>(): undefined | Store<S> {
    return useContext(StoreContextV4) as undefined | Store<S>
}

/*
* EXAMPLE
*
* const [books, setBooks] = useStoreState(state => state.books)
* const [selectedFood, setSelectedFood] = useStoreState(state => state.food[selectedFoodIndex])
*/
export function useStoreStateV4<S extends ReduxReducerState, V>(selectorOptional: StoreSelector<S, V>): StateManager<V>
export function useStoreStateV4<S extends ReduxReducerState>(): StateManager<S>
export function useStoreStateV4<S extends ReduxReducerState, V>(selectorOptional?: undefined | StoreSelector<S, V>): StateManager<S | V> {
    const selector = (selectorOptional ?? identity) as StoreSelector<ReduxReducerState, unknown>
    const store = useStoreContextV4<S>()!
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

export function selectStatePath(state: ReduxReducerState, selector: StoreSelector<ReduxReducerState, unknown>): StatePath {
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

export function mutateState<S extends ReduxReducerState = ReduxReducerState>(
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
): void {
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

export function createStateProxy<S extends ReduxReducerState>(state: S, onGet: (key: PropertyKey) => void): S {
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

export function asPathKey(path: StatePath): string {
    return '/' + path.slice(1).map(it => String(it).replaceAll('/', '_')).join('/')
}

export function forEachPath(path: StatePath, fn: Fn<[StatePath], unknown>): void {
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

export interface StoreProviderV4Props<S extends ReduxReducerState> extends StoreDefinition<S> {
    children: undefined | React.ReactNode
}

export interface StoreDefinition<S extends ReduxReducerState> {
    createState(): S
    onChange?: undefined | ((args: OnChangeEventArgs) => void)
}

export interface Store<S extends ReduxReducerState> {
    stateRef: React.MutableRefObject<S>
    state(): S
    observe(path: StatePath, observer: Task): Task
    mutate<V>(path: StatePath, value: StateSetterArg<V>): void
}

export type StatePath = Array<PropertyKey>


export interface OnChangeEventArgs<S extends ReduxReducerState = ReduxReducerState> {
    state: S,
    stateOld: S
    path: StatePath,
    pathKey: string,
    value: any,
    valueOld: any,
}
