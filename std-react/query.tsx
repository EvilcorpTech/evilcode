import { createContext, createElement, useContext, useEffect, useRef, useState } from 'react'
import { Query } from '@eviljs/std-web/query'

export const QueryContext = createContext<Query>(void undefined as any)
export const QueryCancelled = Symbol('QueryCancelled')

export function useQuery<A extends Array<unknown>, R>(queryRunner: QueryRunner<A, R>) {
    const [ response, setResponse ] = useState<R | null>(null)
    const [ pending, setPending ] = useState(false)
    const mountedRef = useRef(true)
    const taskRef = useRef<QueryTask<R> | null>(null)
    const query = useContext(QueryContext)

    useEffect(() => {
        function unmount() {
            mountedRef.current = false
        }

        return unmount
    }, [])

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

export function withQuery(children: React.ReactNode, query: Query) {
    return (
        <QueryContext.Provider value={query}>
            {children}
        </QueryContext.Provider>
    )
}

export function QueryProvider(props: QueryProviderProps) {
    return withQuery(props.children, props.query)
}

export function WithQuery(Child: React.ElementType, query: Query) {
    function QueryProviderProxy(props: any) {
        return withQuery(<Child {...props}/>, query)
    }

    return QueryProviderProxy
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
