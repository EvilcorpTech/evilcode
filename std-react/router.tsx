import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createRouter, link, patternFromPath, readHashRoute, routeTo } from '@eviljs/std-web/router'

export const RouterContext = createContext<Router>(void undefined as any)

export function useRouter() {
    return useContext(RouterContext)
}

export function useRootRouter() {
    const defaultRoute = readHashRoute()
    const [ route, setRoute ] = useState(defaultRoute)

    const routeDoesMatch = useCallback((path: string) => {
        const pattern = patternFromPath(path)
        return pattern.test(route)
    }, [route])

    const routeMatch = useCallback((path: string) => {
        const pattern = patternFromPath(path)
        return route.match(pattern)
    }, [route])

    function routeHandler(nextRoute: string) {
        setRoute(nextRoute)
    }

    useEffect(() => {
        const router = createRouter(routeHandler)

        router.start()

        function unmount() {
            router.stop()
        }

        return unmount
    }, [])

    const router = useMemo(() => {
        return {link, route, routeDoesMatch, routeMatch, routeTo}
    }, [link, route, routeDoesMatch, routeTo])

    return router
}

export function WithRouter(Child: React.ElementType) {
    function RouterProviderProxy(props: any) {
        return providingRouter(<Child {...props}/>)
    }

    return RouterProviderProxy
}

export function RouterProvider(props: RouterProviderProps) {
    return providingRouter(props.children)
}

export function providingRouter(children: JSX.Element) {
    const router = useRootRouter()

    return (
        <RouterContext.Provider value={router}>
            {children}
        </RouterContext.Provider>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps {
    children: JSX.Element
}

export interface Router {
    link(path: string): string
    route: string
    routeDoesMatch(path: string): boolean
    routeMatch(path: string): RegExpMatchArray | null
    routeTo(path: string): void
}
