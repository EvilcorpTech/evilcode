import {createContext, createElement, useContext} from 'react'
import {Fetch} from '@eviljs/std-web/fetch'

export const FetchContext = createContext<Fetch>(void undefined as any)

export function useFetch() {
    return useContext(FetchContext)
}

export function withFetch(children: React.ReactNode, fetch: Fetch) {
    return (
        <FetchContext.Provider value={fetch}>
            {children}
        </FetchContext.Provider>
    )
}

export function FetchProvider(props: FetchProviderProps) {
    return withFetch(props.children, props.fetch)
}

export function WithFetch(Child: React.ElementType, fetch: Fetch) {
    function FetchProviderProxy(props: any) {
        return withFetch(<Child {...props}/>, fetch)
    }

    return FetchProviderProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchProviderProps {
    children: React.ReactNode
    fetch: Fetch
}
