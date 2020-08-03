import {createContext, createElement, useContext, useMemo, useReducer} from 'react'
import {error, StdError} from '@eviljs/std-lib/error'

export const StoreContext = createContext<Store>(void undefined as any)

export class InvalidAction extends StdError {}

/*
* EXAMPLE
*
* const spec = {createState, actions}
* const main = WithStore(MyMain, spec)
*
* render(<main/>, document.body)
*/
export function WithStore(Child: React.ElementType, spec: StoreSpec) {
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
export function withStore(children: React.ReactNode, spec: StoreSpec) {
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
export function StoreProvider(props: StoreProviderProps) {
    return withStore(props.children, props.spec)
}

export function useRootStore(spec: StoreSpec) {
    const {createState, actions} = spec

    function reduce(state: unknown, action: Action<unknown>) {
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

export function useStore() {
    return useContext(StoreContext)
}

export function throwInvalidAction(action: string) {
    const message =
        '@eviljs/std-react/store:\n'
        + `missing action '${action}'.`
    return error({type: InvalidAction, message})
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StoreProviderProps<S = any, A extends Actions<S> = Actions<S>> {
    children: React.ReactNode
    spec: StoreSpec<S, A>
}

export interface Store<S = any, A extends Action<any> = Action<any>> {
    state: S
    commit: React.Dispatch<A>
}

export interface StoreSpec<S = any, A extends Actions<S> = Actions<S>> {
    actions: A
    createState(): S
    // TODO: getters, effects, plugs.
}

export type Actions<S> = Record<string, React.Reducer<S, any>>

export type Action<V> = {
    type: string
    value?: V
}

export type StoreActions<A extends Actions<any>> = ObjectValues<{
    [key in keyof A]: {
        type: key
        value: Parameters<A[key]>[1]
    }
}>

export type ObjectValues<T> = T[keyof T]
