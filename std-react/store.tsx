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

export function WithStore(Child: React.ElementType, spec: StoreSpec) {
    function StoreProviderProxy(props: any) {
        return providingStore(<Child {...props}/>, spec)
    }

    return StoreProviderProxy
}

export function StoreProvider(props: StoreProviderProps) {
    return providingStore(props.children, props.spec)
}

export function providingStore(children: JSX.Element, spec: StoreSpec) {
    const store = useRootStore(spec)

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps {
    children: JSX.Element
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
