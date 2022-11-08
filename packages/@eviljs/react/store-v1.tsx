import {computeValue} from '@eviljs/std/fn.js'
import {areSameObjectsShallow} from '@eviljs/std/object.js'
import type {Partial} from '@eviljs/std/type.js'
import {useCallback, useContext, useMemo, useReducer} from 'react'
import {defineContext} from './ctx.js'

export const StoreV1Context = defineContext<Store<StoreStateGeneric, any>>('StoreV1Context')

export let StoreActionUid = 0

/*
* EXAMPLE
*
* const spec = {createState, actions}
* const Main = WithStore(MyMain, spec)
*
* render(<Main/>, document.body)
*/
export function WithStore<P extends {}, S extends StoreStateGeneric, A>(Child: React.ComponentType<P>, spec: StoreSpec<S, A>) {
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
export function withStore<S extends StoreStateGeneric, A>(children: React.ReactNode, spec: StoreSpec<S, A>) {
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
export function StoreProvider<S extends StoreStateGeneric, A>(props: StoreProviderProps<S, A>) {
    return withStore(props.children, props.spec)
}

export function useRootStore<S extends StoreStateGeneric, A>(spec: StoreSpec<S, A>) {
    const {createState, reduce, onDispatch} = spec
    const [state, commit] = useReducer(reduce, null, createState)

    const dispatch = useCallback((action: A) => {
        onDispatch?.(action)

        commit(action)
    }, [commit, onDispatch])

    const store = useMemo((): Store<S, A> => {
        return [state, dispatch]
    }, [state, dispatch])

    return store
}

export function useStore<S extends StoreStateGeneric, A>() {
    return useContext(StoreV1Context) as undefined | Store<S, A>
}

export function patchState<S extends StoreStateGeneric>(state: S, statePatch: StoreStatePatch<S>): S {
    const nextState = computeValue(statePatch, state)

    return areSameObjectsShallow(state, nextState)
        ? state
        : {...state, ...nextState}
}

export function defineAction<K extends PropertyKey, S extends StoreStateGeneric, A extends Array<unknown>>(
    id: K,
    reducer: (state: S, ...args: A) => S,
): StoreActionDefinition<K, S, A>
{
    return {
        id,
        action(...args: A) {
            return {type: id, args}
        },
        reducer(state: S, action: {} | StoreAction<K, A>) {
            return action && ('type' in action) && action.type === id
                ? reducer(state, ...action.args)
                : state
        },
    }
}

export function withId(name: string) {
    return `#${++StoreActionUid} ${name}`
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S extends StoreStateGeneric, A> {
    children: React.ReactNode
    spec: StoreSpec<S, A>
}

export interface StoreSpec<S extends StoreStateGeneric, A> {
    createState(): S
    reduce(state: S, action: A): S
    onDispatch?: undefined | ((action: A) => void)
}

export type Store<S extends StoreStateGeneric, A> = [S, React.Dispatch<A>]

export type StoreStateGeneric = {}

export interface StoreAction<K extends PropertyKey, A extends Array<unknown>> {
    type: K
    args: A
}

export interface StoreActionDefinition<K extends PropertyKey, S extends StoreStateGeneric, A extends Array<unknown>> {
    id: K
    action(...args: A): StoreAction<K, A>
    reducer(state: S, action: unknown): S
}

// export type StoreActionsOf<S extends StoreStateGeneric, A> = ValueOf<{
//     [key in keyof A]: StoreActionWithArg<key, Parameters<A[key]>[1]>
// }>

export type StoreStatePatch<S extends StoreStateGeneric> = Partial<S> | ((prevState: S) => Partial<S>)
