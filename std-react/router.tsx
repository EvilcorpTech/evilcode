import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createRouter, isPathRouted, link, readHashRoute, routeTo } from '@eviljs/std-web/router'

export const RouterContext = createContext<Router>(void undefined as any)

export function useRouter() {
    return useContext(RouterContext)
}

export function useRootRouter() {
    const defaultRoute = readHashRoute()
    const [ route, setRoute ] = useState(defaultRoute)

    const isRouted = useCallback(path => {
        return isPathRouted(path, route)
    }, [route])

    function routeHandler(nextRoute: string) {
        setRoute(nextRoute)
    }

    useEffect(() => {
        const router = createRouter(routeHandler)

        router.start()

        function teardown() {
            router.stop()
        }

        return teardown
    }, [])


    const router = useMemo(() => {
        return {isRouted, link, route, routeTo}
    }, [isRouted, link, route, routeTo])

    return router
}

export function RouterProvider(props: RouterProviderProps) {
    const { children } = props
    const router = useRootRouter()

    return (
        <RouterContext.Provider value={router}>
            {children}
        </RouterContext.Provider>
    )
}

export function withRouter(Child: React.ComponentType) {
    function RouterWrapper(props: any) {
        return (
            <RouterProvider>
                <Child {...props}/>
            </RouterProvider>
        )
    }

    return RouterWrapper
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps {
    children?: React.ReactNode
}

export interface Router {
    isRouted: (path: string) => boolean
    link: (path: string) => string
    route: string
    routeTo: (path: string) => void
}