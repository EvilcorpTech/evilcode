import type {Router} from '@eviljs/web/router'
import {useContext, useEffect} from 'react'
import {defineContext} from './ctx.js'

export const RouterContext: React.Context<undefined | Router> = defineContext<Router>('RouterContext')

/*
* EXAMPLE
*
* const options = {type, basePath}
*
* <RouterProvider options={options}>
*     <MyApp/>
* </RouterProvider>
*/
export function RouterProvider(props: RouterProviderProps): JSX.Element {
    const {children, router} = props

    useEffect(() => {
        router.start() // Router must not be stopped on unmount.
    }, [router])

    return <RouterContext.Provider value={router} children={children}/>
}

export function useRouterContext<S = unknown>(): undefined | Router<S> {
    return useContext(RouterContext as React.Context<undefined | Router<S>>)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps<S = unknown> {
    children: undefined | React.ReactNode
    router: Router<S>
}
