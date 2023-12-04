import type {Router} from '@eviljs/web/router.js'
import {useEffect} from 'react'
import {defineContext} from './ctx.js'

export const RouterContext = defineContext<Router>('RouterContext')

/*
* EXAMPLE
*
* const options = {type, basePath}
*
* <RouterProvider options={options}>
*     <MyApp/>
* </RouterProvider>
*/
export function RouterProvider(props: RouterProviderProps) {
    const {children, router} = props

    useEffect(() => {
        router.start() // Router must not be stopped on unmount.
    }, [router])

    return <RouterContext.Provider value={router} children={children}/>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps<S = unknown> {
    children: undefined | React.ReactNode
    router: Router<S>
}
