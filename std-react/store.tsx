import {error, StdError} from '@eviljs/std-lib/error.js'
import {ValueOf} from '@eviljs/std-lib/type.js'
import React from 'react'
const {createContext, useContext, useMemo, useReducer} = React

export const StoreContext = createContext<Store<unknown, StoreActions<unknown>>>(void undefined as any)

export class InvalidAction extends StdError {}

StoreContext.displayName = 'StdStoreContext'

/*
* EXAMPLE
*
* const spec = {createState, actions}
* const main = WithStore(MyMain, spec)
*
* render(<main/>, document.body)
*/
export function WithStore<S, A extends StoreActions<S>>(Child: React.ElementType, spec: StoreSpec<S, A>) {
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
*     const main = withStore(<MyMain/>, spec)
*
*     return <main/>
* }
*/
export function withStore<S, A extends StoreActions<S>>(children: React.ReactNode, spec: StoreSpec<S, A>) {
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
export function StoreProvider<S, A extends StoreActions<S>>(props: StoreProviderProps<S, A>) {
    return withStore(props.children, props.spec)
}

export function useRootStore<S, A extends StoreActions<S>>(spec: StoreSpec<S, A>) {
    const {createState, actions} = spec

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

    return store
}

export function useStore<S, A extends StoreActions<S>>() {
    return useContext(StoreContext) as Store<S, A>
}

export function throwInvalidAction(action: string) {
    const message =
        '@eviljs/std-react/store:\n'
        + `missing action '${action}'.`
    return error({type: InvalidAction, message})
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S, A extends StoreActions<S>> {
    children: React.ReactNode
    spec: StoreSpec<S, A>
}

export interface StoreSpec<S, A extends StoreActions<S>> {
    actions: A
    createState(): S
    // TODO: getters, effects, plugs.
}

export interface Store<S, A extends StoreActions<S>> {
    state: S
    commit: React.Dispatch<StoreActionsOf<S, A>>
}

export interface StoreActions<S> extends Record<string, React.Reducer<S, any>> {
}

export interface StoreAction<V> {
    type: string
    value: V
}

export type StoreActionsOf<S, A extends StoreActions<S>> = ValueOf<{
    [key in keyof A]: {
        type: key
        value: Parameters<A[key]>[1]
    }
}>
