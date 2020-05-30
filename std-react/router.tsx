import {createContext, createElement, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {createRouter, link, readHashRoute, routeTo} from '@eviljs/std-web/router'

export const RouterContext = createContext<Router>(void undefined as any)

export function useRouter() {
    return useContext(RouterContext)
}

export function useRootRouter() {
    const defaultRoute = readHashRoute()
    const [route, setRoute] = useState(defaultRoute)

    const routeDoesMatch = useCallback((patternRe: RegExp) => {
        const doesMatch = patternRe.test(route)

        return doesMatch
    }, [route])

    const routeMatch = useCallback((patternRe: RegExp) => {
        const matches = route.match(patternRe)

        return matches
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
    link(path: string): string
    route: string
    routeDoesMatch(patternRe: RegExp): boolean
    routeMatch(patternRe: RegExp): RegExpMatchArray | null
    routeTo(path: string): void
}
