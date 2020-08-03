import {createContext, createElement, useContext, useEffect, useRef, useState} from 'react'
import {Query} from '@eviljs/std-web/query'
import {useMountedRef} from './react'

export const QueryContext = createContext<Query>(void undefined as any)
export const QueryCancelled = Symbol('QueryCancelled')

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const query = createQuery(fetch)
* const main = WithQuery(MyMain, query)
*
* render(<main/>, document.body)
*/
export function WithQuery(Child: React.ElementType, query: Query) {
    function QueryProviderProxy(props: any) {
        return withQuery(<Child {...props}/>, query)
    }

    return QueryProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const fetch = createFetch({baseUrl: '/api'})
*     const query = createQuery(fetch)
*     const main = withQuery(<MyMain/>, fetch)
*
*     return <main/>
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
* export function MyMain(props) {
*     const fetch = createFetch({baseUrl: '/api'})
*     const query = createQuery(fetch)
*
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
    const [response, setResponse] = useState<R | null>(null)
    const [pending, setPending] = useState(false)
    const mountedRef = useMountedRef()
    const taskRef = useRef<QueryTask<R> | null>(null)
    const query = useContext(QueryContext)

    async function fetch(...args: A) {
        setPending(true)

        const promise = queryRunner(query, ...args)
        const task = {promise, cancelled: false}
        taskRef.current = task

        try {
            const response = await task.promise

            if (! mountedRef.current || task.cancelled) {
                return QueryCancelled
            }

            setResponse(response)

            return response
        }
        finally {
            if (mountedRef.current && ! task.cancelled) {
                setPending(false)
            }
        }
    }

    function cancel() {
        if (taskRef.current) {
            taskRef.current.cancelled = true
        }

        setPending(false)
    }

    function reset() {
        setResponse(null)
    }

    return {fetch, response, pending, reset, cancel}
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
