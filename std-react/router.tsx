import {classes} from './react.js'
import {createRouter, compilePattern, exact, regexpFromPattern, RouterOptions, RouterParams, RouterRouteParams} from '@eviljs/std-web/router.js'
import {isFunction, isPromise} from '@eviljs/std-lib/type.js'
import React from 'react'
const {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, Fragment} = React

export {exact, All, Arg, End, Value, Path, PathOpt, PathGlob, Start} from '@eviljs/std-web/router.js'

export const RouterContext = createContext<Router>(void undefined as any)
export const DefaultRouteActiveClass = 'route-active'

RouterContext.displayName = 'StdRouterContext'

/*
* EXAMPLE
*
* const options = {type, basePath}
* const main = WithRouter(MyMain, options)
*
* render(<main/>, document.body)
*/
export function WithRouter(Child: React.ElementType) {
    function RouterProviderProxy(props: any) {
        return withRouter(<Child {...props}/>)
    }

    return RouterProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const options = {type, basePath}
*     const main = withRouter(<MyMain/>, options)
*
*     return <main/>
* }
*/
export function withRouter(children: React.ReactNode, options?: RouterOptions) {
    const router = useRootRouter(options)

    return (
        <RouterContext.Provider value={router}>
            {children}
        </RouterContext.Provider>
    )
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const options = {type, basePath}
*
*     return (
*         <RouterProvider options={options}>
*             <MyApp/>
*         </RouterProvider>
*     )
* }
*/
export function RouterProvider(props: RouterProviderProps) {
    return withRouter(props.children, props.options)
}

export function useRootRouter(options?: RouterOptions) {
    const globalRouter = useMemo(() => {
        return createRouter(onRouteChange, options)
    }, [])
    const [route, setRoute] = useState(() => globalRouter.getRoute())

    const testRoute = useCallback((pattern: RegExp) => {
        return pattern.test(route.path)
    }, [route.path])

    const matchRoute = useCallback((pattern: RegExp) => {
        return route.path.match(pattern)
    }, [route.path])

    const routeTo = useCallback((path: string, params?: RouterParams) => {
        globalRouter.setRoute(path, params)
        setRoute(globalRouter.getRoute())
    }, [globalRouter])

    useEffect(() => {
        globalRouter.start()

        function unmount() {
            globalRouter.stop()
        }

        return unmount
    }, [globalRouter])

    const router = useMemo(() => {
        const {link} = globalRouter
        const routePath = route.path
        const routeParams = route.params

        return {routePath, routeParams, routeTo, testRoute, matchRoute, link}
    }, [globalRouter, route.path, route.params, testRoute, matchRoute])

    function onRouteChange(path: string, params: RouterRouteParams) {
        setRoute({path, params})
    }

    return router
}

export function useRouter() {
    return useContext(RouterContext)
}

export function useRouterTransition() {
    const {routePath: toRoute} = useRouter()
    const prevRouteRef = useRef(toRoute)

    const transition = useMemo(() => {
        const fromRoute = prevRouteRef.current
        prevRouteRef.current = toRoute
        return {fromRoute, toRoute}
    }, [toRoute])

    return transition
}

/*
* EXAMPLE
* <SwitchRoute default={<NotFoundView/>}>
* {[
*     {is: new RegExp(`^/book/${Arg}/${Arg}`, 'i'), then: (arg1, arg2) => (
*         <h1>/book/{arg1}/{arg2}</h1>
*     )},
*     {is: Start+'/book'+End, then: <h1>/book exact</h1>},
*     {is: exact('/book'), then: <h1>/book exact</h1>},
*     {is: '^/book', then: <h1>/book*</h1>},
*     {is: '^/$', then: <h1>/ exact</h1>},
*     {is: '^/', then: <h1>/*</h1>},
* ]}
* </SwitchRoute>
*/
export function SwitchRoute(props: SwitchRouteProps) {
    const {children, default: fallback} = props
    const {matchRoute} = useRouter()

    const [then, matches] = useMemo(() => {
        for (const it of children) {
            const {is, then} = it

            const pathRe = compilePattern(is)
            const matches = matchRoute(pathRe)

            if (matches) {
                return [then, matches]
            }
        }

        if (fallback) {
            return [fallback, []]
        }

        return []
    }, [children, matchRoute])

    return renderRouteChildren(then, matches)
}

/*
* EXAMPLE
* <WhenRoute is="^/$">
*     <h1>/ exact</h1>
* </WhenRoute>
* <WhenRoute is="^/book">
*     <h1>/book*</h1>
* </WhenRoute>
* <WhenRoute is={Start+'/book'+End}>
*     <h1>/book exact</h1>
* </WhenRoute>
* <WhenRoute is={exact('/book')}>
*     <h1>/book exact</h1>
* </WhenRoute>
* <WhenRoute is={new RegExp('^/book(?:/)?$', 'i')}>
*     <h1>/book</h1>
* </WhenRoute>
* <WhenRoute is={`^/book/${Arg}/${Arg}${End}`}>
*     {(arg1, arg2) =>
*         <h1>/book/{arg1}/{arg2}</h1>
*     }
* </WhenRoute>
*/
export function WhenRoute(props: WhenRouteProps) {
    const {children, is} = props
    const {matchRoute} = useRouter()

    const matches = useMemo(() => {
        const pathRe = regexpFromPattern(is)
        const matches = matchRoute(pathRe)

        return matches
    }, [is, matchRoute])

    return renderRouteChildren(children, matches)
}

/*
* EXAMPLE
* <Route to="/book/123" if={formSaved}>
*     <button>Click</button>
* </Route>
* <Route to="/book/123" if={() => formSaved ? true : false}>
*     <button>Click</button>
* </Route>
* <Route to="/book/123" if={() => Promise.resolve(formSaved)}>
*     <button>Click</button>
* </Route>
*/
export function Route(props: RouteProps) {
    const {children, elRef, to, params, if: guard, activeWhenExact, activeClass, ...otherProps} = props
    const {link, routeTo, testRoute} = useRouter()

    const onChange = useCallback((event: React.MouseEvent) => {
        event.preventDefault()

        function tryRouting(response: boolean | null | undefined) {
            if (response === false) {
                // Routing is blocked only in case of false return value.
                return
            }

            routeTo(to, params)
        }

        const guardResponse = isFunction(guard)
            ? guard()
            : guard

        if (isPromise(guardResponse)) {
            guardResponse.then(tryRouting)
        }
        else {
            tryRouting(guardResponse)
        }
    }, [routeTo, to, params, guard])

    const isActive = useMemo(() => {
        const path = activeWhenExact
            ? exact(to)
            : to
        const pathRe = regexpFromPattern(path)

        return testRoute(pathRe)
    }, [to, testRoute])

    return (
        <a
            {...otherProps}
            ref={elRef}
            className={classes(props.className, {
                [activeClass ?? DefaultRouteActiveClass]: isActive,
            })}
            href={link(to, params)}
            onClick={onChange}
        >
            {children}
        </a>
    )
}

export function Redirect(props: RedirectProps) {
    const {to, params} = props
    const {routeTo} = useRouter()

    useEffect(() =>
        routeTo(to, params)
    )

    return null
}

export function renderRouteChildren(children: RouteMatchChildren, matches: RouteMatches | null | undefined) {
    if (! matches) {
        return null
    }

    const args = matches.slice(1) // Without the whole match.

    return (
        <Fragment>
        {
            isFunction(children)
                ? children(...args)
                : children
        }
        </Fragment>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps {
    children: React.ReactNode
    options: RouterOptions
}

export interface Router {
    routePath: string
    routeParams: RouterRouteParams
    routeTo(path: string, params?: RouterParams): void
    testRoute(pattern: RegExp): boolean
    matchRoute(pattern: RegExp): RegExpMatchArray | null
    link(path: string, params?: RouterParams): string
}

export interface SwitchRouteProps {
    children: Array<{
        is: string | RegExp
        then: RouteMatchChildren
    }>
    default?: React.ReactNode
}

export interface WhenRouteProps {
    children: RouteMatchChildren
    is: string | RegExp
}

export interface RouteProps {
    className?: string
    children: React.ReactNode
    elRef?: React.Ref<HTMLAnchorElement>
    to: string
    params?: RouterParams
    if?(): boolean | Promise<boolean>
    activeWhenExact?: boolean
    activeClass?: string
    [key: string]: unknown
}

export interface RedirectProps {
    to: string
    params?: RouterParams
}

export type RouteMatchChildren =
    | React.ReactNode
    | ((...matches: RouteMatches) => React.ReactNode)

export type RouteMatches = Array<string>
