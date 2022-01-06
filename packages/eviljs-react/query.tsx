import {Query} from '@eviljs/web/query.js'
import {useMountedRef} from './react.js'
import {createContext, useCallback, useContext, useRef, useState} from 'react'

export const QueryContext = createContext<Query>(void undefined as any)

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
export function WithQuery<P extends {}>(Child: React.ComponentType<P>, query: Query) {
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
*     return withQuery(<Children/>, fetch)
* }
*/
export function withQuery(children: React.ReactNode, query: Query) {
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

export function useQuery<A extends Array<unknown>, R>(queryRunner: QueryRunner<A, R>) {
    const [response, setResponse] = useState<null | R>(null)
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<null | unknown>(null)
    const mountedRef = useMountedRef()
    const taskRef = useRef<null | QueryTask<R>>(null)
    const query = useContext(QueryContext)

    const fetch = useCallback(async (...args: A) => {
        if (taskRef.current) {
            // We automatically cancel previous task.
            taskRef.current.cancelled = true
        }

        setPending(true)
        setError(null)
        // We must retain current response and error states.
        // Whether the developer wants to clear them, he uses the reset() API
        // before issuing a fetch() request.

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

            setPending(false) // 1) We settle
            setError(null) // 2) ...without any error
            setResponse(response) // 3) ...with a response.

            return response
        }
        catch (error) {
            if (! mountedRef.current) {
                return
            }
            if (task.cancelled) {
                return
            }

            setPending(false) // 1) We settle
            setError(error) // 2) ...with an error
            setResponse(null) // 3) ...without a response.

            return // Makes TypeScript happy.
        }
    }, [queryRunner])

    const cancel = useCallback(() => {
        if (taskRef.current) {
            taskRef.current.cancelled = true
        }

        setPending(false)
    }, [])

    const reset = useCallback(() => {
        setResponse(null)
        setError(null)
    }, [])

    return {fetch, response, error, pending, reset, cancel}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface QueryProviderProps {
    children: React.ReactNode
    query: Query
}

export interface QueryRunner<A extends Array<unknown>, R> {
    (query: Query, ...args: A): Promise<R>
}

export interface QueryTask<T> {
    promise: Promise<T>
    cancelled: boolean
}
