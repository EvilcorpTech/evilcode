import { createContext, createElement, useContext } from 'react'
import { Fetch } from '@eviljs/std-web/fetch'

export const FetchContext = createContext<Fetch>(void undefined as any)

export function useFetch() {
    return useContext(FetchContext)
}

export function FetchProvider(props: FetchProviderProps) {
    const { fetch, children } = props

    return (
        <FetchContext.Provider value={fetch}>
            {children}
        </FetchContext.Provider>
    )
}

export function withFetch(Child: React.ComponentType, fetch: Fetch) {
    function FetchWrapper(props: any) {
        return (
            <FetchProvider fetch={fetch}>
                <Child {...props}/>
            </FetchProvider>
        )
    }

    return FetchWrapper
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchProviderProps {
    children?: React.ReactNode
    fetch: Fetch
}