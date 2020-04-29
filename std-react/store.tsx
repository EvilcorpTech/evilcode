import { createContext, createElement, useContext, useMemo, useReducer } from 'react'

export const StoreContext = createContext<Store>(void undefined as any)

export function useStore() {
    return useContext(StoreContext)
}

export function useRootStore(spec: StoreSpec) {
    const { createState, actions } = spec

    function reduce(state: any, action: Action) {
        const handler = actions[action.type]

        if (! handler) {
            throw `missing_action: ${action.type}`
        }

        return handler(state, action.value)
    }

    const [ state, commit ] = useReducer(reduce, null, createState)

    const store = useMemo(() => {
        return {state, commit}
    }, [state, commit])

    return store
}

export function withStore(children: React.ReactNode, spec: StoreSpec) {
    const store = useRootStore(spec)

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    )
}

export function StoreProvider(props: StoreProviderProps) {
    return withStore(props.children, props.spec)
}

export function WithStore(Child: React.ElementType, spec: StoreSpec) {
    function StoreProviderProxy(props: any) {
        return withStore(<Child {...props}/>, spec)
    }

    return StoreProviderProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps {
    children: React.ReactNode
    spec: StoreSpec
}

export interface StoreSpec {
    actions: Actions
    createState: CreateState
    // TODO: getters, effects, plugs.s
}

export type CreateState = () => any
export type Actions = Record<string, Reducer>
export type Reducer = (state: any, value?: any) => any

interface Store<T = unknown> {
    state: T
    commit: React.Dispatch<any>
}

export type Action = {
    type: string
    value?: any
}
