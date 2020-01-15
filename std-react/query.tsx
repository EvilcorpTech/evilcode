import { createContext, createElement, useContext, useState } from 'react'
import { Query, QueryRequestOptions } from '@eviljs/std-web/query'

export const QueryContext = createContext<Query>(void undefined as any)

export function QueryProvider(props: QueryProviderProps) {
    const { query, children } = props

    return (
        <QueryContext.Provider value={query}>
            {children}
        </QueryContext.Provider>
    )
}

export function withQuery(Child: React.ComponentType, query: Query) {
    function QueryWrapper(props: any) {
        return (
            <QueryProvider query={query}>
                <Child {...props}/>
            </QueryProvider>
        )
    }

    return QueryWrapper
}

export function useQuery<T>(queryRunner: QueryRunner<T>) {
    const [ response, setResponse ] = useState<T>()
    const [ pending, setPending ] = useState(false)
    const query = useContext(QueryContext)

    async function run(options?: QueryRequestOptions) {
        setPending(true)

        try {
            const response = await queryRunner(query, options)
            setResponse(response)
            return response
        }
        finally {
            setPending(false)
        }
    }

    function reset() {
        setResponse(void undefined)
    }

    return [run, response, pending, reset] as const
}

// Types ///////////////////////////////////////////////////////////////////////

export interface QueryProviderProps {
    children?: React.ReactNode
    query: Query
}

export type QueryRunner<T> = (query: Query, options?: QueryRequestOptions)
    => Promise<T>