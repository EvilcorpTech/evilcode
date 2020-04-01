import { createContext, createElement, useContext } from 'react'
import { Fetch } from '@eviljs/std-web/fetch'

export const FetchContext = createContext<Fetch>(void undefined as any)

export function useFetch() {
    return useContext(FetchContext)
}

export function WithFetch(Child: React.ElementType, fetch: Fetch) {
    function FetchProviderProxy(props: any) {
        return providingFetch(<Child {...props}/>, fetch)
    }

    return FetchProviderProxy
}

export function FetchProvider(props: FetchProviderProps) {
    return providingFetch(props.children, props.fetch)
}

export function providingFetch(children: JSX.Element, fetch: Fetch) {
    return (
        <FetchContext.Provider value={fetch}>
            {children}
        </FetchContext.Provider>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchProviderProps {
    children: JSX.Element
    fetch: Fetch
}
