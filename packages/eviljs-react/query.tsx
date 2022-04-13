import {createContext, useCallback, useContext, useRef, useState} from 'react'
import {useMountedRef} from './hook.js'

export {asBaseUrl, joinPath} from '@eviljs/web/url.js'

export const QueryContext = createContext<unknown>(undefined)

QueryContext.displayName = 'QueryContext'

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const query = createQuery(fetch)
* const Main = WithQuery(MyMain, query)
*
* render(<Main/>, document.body)
*/
export function WithQuery<P extends {}>(Child: React.ComponentType<P>, query: unknown) {
    function QueryProviderProxy(props: P) {
        return withQuery(<Child {...props}/>, query)
    }

    return QueryProviderProxy
}

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const query = createQuery(fetch)
*
* export function MyMain(props) {
*     return withQuery(<Children/>, query)
* }
*/
export function withQuery(children: React.ReactNode, query: unknown) {
    return (
        <QueryContext.Provider value={query}>
            {children}
        </QueryContext.Provider>
    )
}

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const query = createQuery(fetch)
*
* export function MyMain(props) {
*     return (
*         <QueryProvider query={query}>
*             <MyApp/>
*         </QueryProvider>
*     )
* }
*/
export function QueryProvider(props: QueryProviderProps) {
    return withQuery(props.children, props.query)
}

export function useQuery<Q, A extends Array<unknown>, R>(queryRunner: QueryRunner<Q, A, R>) {
    interface UseQueryState {
        pending: boolean
        response: undefined | R
        error: undefined | unknown
    }
    const [state, setState] = useState<UseQueryState>({
        pending: false,
        response: undefined,
        error: undefined,
    })
    const mountedRef = useMountedRef()
    const taskRef = useRef<null | QueryTask<R>>(null)
    const query = useContext<Q>(QueryContext as React.Context<Q>)

    const fetch = useCallback(async (...args: A) => {
        if (taskRef.current) {
            // We automatically cancel previous task.
            taskRef.current.cancelled = true
        }

        // We must retain current response and error states.
        // Whether the developer wants to clear them, he uses the reset() API
        // before issuing a fetch() request.
        setState(state => ({
            ...state,
            pending: true,
        }))

        taskRef.current = {
            promise: queryRunner(query, ...args),
            cancelled: false,
        }

        const task = taskRef.current

        try {
            const response = await task.promise

            if (! mountedRef.current) {
                return
            }
            if (task.cancelled) {
                return
            }

            setState(state => ({
                ...state,
                pending: false, // We settle.
                response, // With a response.
                error: undefined, // Without any error.
            }))

            return response
        }
        catch (error) {
            if (! mountedRef.current) {
                return
            }
            if (task.cancelled) {
                return
            }

            setState(state => ({
                ...state,
                pending: false, // We settle.
                response: undefined, // Without a response.
                error, // With an error.
            }))

            return // Makes TypeScript happy.
        }
    }, [queryRunner])

    const cancel = useCallback(() => {
        if (taskRef.current) {
            taskRef.current.cancelled = true
        }

        setState(state => ({...state, pending: false}))
    }, [])

    const resetResponse = useCallback(() => {
        setState(state => ({...state, response: undefined}))
    }, [])
    const resetError = useCallback(() => {
        setState(state => ({...state, error: undefined}))
    }, [])
    const reset = useCallback(() => {
        setState(state => ({
            ...state,
            response: undefined,
            error: undefined,
        }))
    }, [])

    return {
        fetch,
        pending: state.pending,
        response: state.response,
        error: state.error,
        reset,
        resetError,
        resetResponse,
        cancel,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface QueryProviderProps {
    children: React.ReactNode
    query: unknown
}

export interface QueryRunner<Q, A extends Array<unknown>, R> {
    (query: Q, ...args: A): Promise<R>
}

export interface QueryTask<T> {
    promise: Promise<T>
    cancelled: boolean
}
