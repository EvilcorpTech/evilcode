import {Fetch} from '@eviljs/web/fetch.js'
import {createContext, useContext} from 'react'

export {asBaseUrl, joinPath} from '@eviljs/web/url.js'

export const FetchContext = createContext<unknown>(undefined)

FetchContext.displayName = 'FetchContext'

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
* const Main = WithFetch(MyMain, fetch)
*
* render(<Main/>, document.body)
*/
export function WithFetch<P extends {}>(Child: React.ComponentType<P>, fetch: Fetch) {
    function FetchProviderProxy(props: P) {
        return withFetch(<Child {...props}/>, fetch)
    }

    return FetchProviderProxy
}

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
*
* export function MyMain(props) {
*     return withFetch(<Children/>, fetch)
* }
*/
export function withFetch(children: React.ReactNode, fetch: Fetch) {
    return (
        <FetchContext.Provider value={fetch}>
            {children}
        </FetchContext.Provider>
    )
}

/*
* EXAMPLE
*
* const fetch = createFetch({baseUrl: '/api'})
*
* export function MyMain(props) {
*     return (
*         <FetchProvider fetch={fetch}>
*             <MyApp/>
*         </FetchProvider>
*     )
* }
*/
export function FetchProvider(props: FetchProviderProps) {
    return withFetch(props.children, props.fetch)
}

export function useFetch<T = Fetch>() {
    return useContext<T>(FetchContext as React.Context<T>)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface FetchProviderProps {
    children: React.ReactNode
    fetch: Fetch
}
