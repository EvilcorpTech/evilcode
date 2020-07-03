import {createContext, createElement, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {createRouter} from '@eviljs/std-web/router'

export const RouterContext = createContext<Router>(void undefined as any)

export function useRouter() {
    return useContext(RouterContext)
}

export function useRootRouter() {
    const globalRouter = useMemo(() => {
        return createRouter(routeHandler)
    }, [])
    const [route, setRoute] = useState(() => globalRouter.route())

    const testRoute = useCallback((pattern: RegExp) => {
        return pattern.test(route)
    }, [route])

    const matchRoute = useCallback((pattern: RegExp) => {
        return route.match(pattern)
    }, [route])

    useEffect(() => {
        globalRouter.start()

        function unmount() {
            globalRouter.stop()
        }

        return unmount
    }, [globalRouter])

    const router = useMemo(() => {
        const {link, routeTo} = globalRouter

        return {link, route, testRoute, matchRoute, routeTo}
    }, [globalRouter, route, testRoute])

    function routeHandler(nextRoute: string) {
        setRoute(nextRoute)
    }

    return router
}

export function withRouter(children: React.ReactNode) {
    const router = useRootRouter()

    return (
        <RouterContext.Provider value={router}>
            {children}
        </RouterContext.Provider>
    )
}

export function RouterProvider(props: RouterProviderProps) {
    return withRouter(props.children)
}

export function WithRouter(Child: React.ElementType) {
    function RouterProviderProxy(props: any) {
        return withRouter(<Child {...props}/>)
    }

    return RouterProviderProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps {
    children: React.ReactNode
}

export interface Router {
    route: string
    routeTo(path: string): void
    testRoute(pattern: RegExp): boolean
    matchRoute(pattern: RegExp): RegExpMatchArray | null
    link(path: string): string
}
