import { createContext, createElement, useContext, useEffect, useRef, useState } from 'react'
import { Query, QueryRequestOptions } from '@eviljs/std-web/query'

export const QueryContext = createContext<Query>(void undefined as any)

export function WithQuery(Child: React.ElementType, query: Query) {
    function QueryProviderProxy(props: any) {
        return providingQuery(<Child {...props}/>, query)
    }

    return QueryProviderProxy
}

export function QueryProvider(props: QueryProviderProps) {
    const { query, children } = props

    return providingQuery(props.children, props.query)
}

export function providingQuery(children: JSX.Element, query: Query) {
    return (
        <QueryContext.Provider value={query}>
            {children}
        </QueryContext.Provider>
    )
}

export function useQuery<T>(queryRunner: QueryRunner<T>) {
    const [ response, setResponse ] = useState<T>()
    const [ pending, setPending ] = useState(false)
    const mountedRef = useRef(true)
    const query = useContext(QueryContext)

    useEffect(() => {
        function unmount() {
            mountedRef.current = false
        }

        return unmount
    }, [])

    async function run(options?: QueryRequestOptions) {
        setPending(true)

        try {
            const response = await queryRunner(query, options)
            if (mountedRef.current) {
                setResponse(response)
            }
            return response
        }
        finally {
            if (mountedRef.current) {
                setPending(false)
            }
        }
    }

    function reset() {
        setResponse(void undefined)
    }

    return [run, response, pending, reset] as const
}

// Types ///////////////////////////////////////////////////////////////////////

export interface QueryProviderProps {
    children: JSX.Element
    query: Query
}

export type QueryRunner<T> = (query: Query, options?: QueryRequestOptions)
    => Promise<T>
