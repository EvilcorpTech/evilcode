import {asArray, isFunction, isPromise} from '@eviljs/std-lib/type.js'
import {classes} from './react.js'
import {createRouter, compilePattern, exact, regexpFromPattern, RouterOptions, RouterParams, RouterRouteParams} from '@eviljs/std-web/router.js'
import React, {CSSProperties} from 'react'
const {createContext, cloneElement, useCallback, useContext, useEffect, useMemo, useRef, useState, Fragment, Children} = React

export {exact, All, Arg, End, Value, Path, PathOpt, PathGlob, Start} from '@eviljs/std-web/router.js'

export const RouterContext = createContext<Router>(void undefined as any)
export const RouteMatchesContext = createContext<RouteMatches>(void undefined as any)
export const DefaultRouteActiveClass = 'route-active'

RouterContext.displayName = 'StdRouterContext'
RouteMatchesContext.displayName = 'StdRouteMatchContext'

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
*     const main = withRouter(<Main/>, options)
*
*     return main
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
* <WhenRoute is={`^/book/${Arg}/${Arg}`}>
*     {(arg1, arg2) =>
*         withRouteMatches([arg1, arg2], <MyComponent/>)
*     }
* </WhenRoute>
*
* <SwitchRoute default={<NotFoundView/>}>
* {[
*     {is: `^/book/${Arg}/${Arg}`, then: (arg1, arg2) => (
*         withRouteMatches([arg1, arg2], <MyComponent/>)
*     )},
* ]}
* </SwitchRoute>
*/
export function withRouteMatches(matches: RouteMatches, children?: React.ReactNode) {
    return (
        <RouteMatchesContext.Provider value={matches}>
            {children}
        </RouteMatchesContext.Provider>
    )
}

/*
* EXAMPLE
*
* <WhenRoute is={`^/book/${Arg}/${Arg}`}>
*     {createRouteMatches(<MyComponent/>)}
* </WhenRoute>
*
* <SwitchRoute default={<NotFoundView/>}>
* {[
*     {is: `^/book/${Arg}/${Arg}`, then: createRouteMatches(<MyComponent/>)},
* ]}
* </SwitchRoute>
*/
export function createRouteMatches(children?: React.ReactNode) {
    function routeMatchesProxy(matches: RouteMatches) {
        return withRouteMatches(matches, children)
    }

    return routeMatchesProxy
}

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
    return withRouter(props.children, props.options)
}

/*
* EXAMPLE
*
* <WhenRoute is={`^/book/${Arg}/${Arg}`}>
*     {(arg1, arg2) =>
*         <RouteMatchProvider matches={[arg1, arg2]}>
*             <MyComponent/>
*         </RouteMatchProvider>
*     }
* </WhenRoute>
*
* <SwitchRoute default={<NotFoundView/>}>
* {[
*     {is: `^/book/${Arg}/${Arg}`, then: (arg1, arg2) => (
*         <RouteMatchProvider matches={[arg1, arg2]}>
*             <MyComponent/>
*         </RouteMatchProvider>
*     )},
* ]}
* </SwitchRoute>
*/
export function RouteMatchProvider(props: RouteMatchProviderProps) {
    return withRouteMatches(props.matches, props.children)
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

export function useRouteMatches() {
    return useContext(RouteMatchesContext)
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
*
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
    const {children, default: fallback, render, ...otherProps} = props
    const {matchRoute} = useRouter()

    const [then, matches] = useMemo(() => {
        for (const it of asArray(children)) {
            const {is, then} = it as SwitchRouteChildren

            const pathRe = compilePattern(is)
            const matches = matchRoute(pathRe)

            if (matches) {
                return [then, cleanMatches(matches)] as const
            }
        }

        if (fallback) {
            return [fallback, []] as const
        }

        return [] as const
    }, [children, matchRoute])

    return renderRouteChildren(then, matches, otherProps, render)
}

/*
* EXAMPLE
*
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
    const {children, is, render, ...otherProps} = props
    const {matchRoute} = useRouter()

    const matches = useMemo(() => {
        const pathRe = regexpFromPattern(is)
        const matches = matchRoute(pathRe)

        return cleanMatches(matches)
    }, [is, matchRoute])

    return renderRouteChildren(children, matches, otherProps, render)
}

/*
* EXAMPLE
*
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

export function Link(props: LinkProps) {
    const {children, to, ...otherProps} = props
    const isRoute = to[0] === '/'

    if (isRoute) {
        return (
            <Route
                {...otherProps}
                className={classes('link-181232 route', props.className)}
                to={to}
            >
                {children}
            </Route>
        )
    }

    return (
        <a
            target="_blank"
            {...otherProps}
            className={classes('link-181232 external', props.className)}
            href={to}
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

export function renderRouteChildren(
    then: RouteMatchChildren | null | undefined,
    matches: RouteMatches | null | undefined,
    props: RouteChildrenProps,
    render?: RouteRenderProps['render'],
) {

    const children: React.ReactNode = isFunction(then)
        ? then(...matches)
        : then

    const clonedChildren = Children.map(children, (it) => {
        const child = it as React.ReactElement<RouteChildrenProps>
        const className = classes(child.props.className, props.className)
        const style = {...child.props.style, ...props.style}
        const childProps = {
            ...child.props,
            ...props,
            className,
            style,
        }
        return cloneElement(child, childProps)
    })

    if (render) {
        return render(clonedChildren)
    }

    return (
        <Fragment>
            {clonedChildren}
        </Fragment>
    )
}

export function cleanMatches(matches: RegExpMatchArray | null) {
    if (! matches) {
        return []
    }

    return matches.slice(1) // Without the whole match.
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps {
    children: React.ReactNode
    options: RouterOptions
}

export interface RouteMatchProviderProps {
    children?: React.ReactNode
    matches: Array<string>
}

export interface Router {
    routePath: string
    routeParams: RouterRouteParams
    routeTo(path: string, params?: RouterParams): void
    testRoute(pattern: RegExp): boolean
    matchRoute(pattern: RegExp): RegExpMatchArray | null
    link(path: string, params?: RouterParams): string
}

export interface SwitchRouteProps extends RouteRenderProps, Omit<React.AllHTMLAttributes<Element>, 'default'> {
    children: SwitchRouteChildren | Array<SwitchRouteChildren>
    default?: React.ReactNode
    [key: string]: any
}

export interface WhenRouteProps extends RouteRenderProps, Omit<React.AllHTMLAttributes<Element>, 'is'> {
    children: RouteMatchChildren
    is: string | RegExp
    [key: string]: any
}

export interface RouteProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode
    elRef?: React.Ref<HTMLAnchorElement>
    to: string
    params?: RouterParams
    if?(): boolean | Promise<boolean>
    activeWhenExact?: boolean
    activeClass?: string
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode
    to: string
}

export interface RedirectProps {
    to: string
    params?: RouterParams
}

export interface RouteRenderProps {
    render?(children: React.ReactNode): React.ReactElement
}

export interface SwitchRouteChildren {
    is: string | RegExp
    then: RouteMatchChildren
}

export type RouteMatchChildren =
    | React.ReactNode
    | ((...matches: RouteMatches) => React.ReactNode)

export type RouteMatches = Array<string> | readonly string[]

export interface RouteChildrenProps {
    className?: string
    style?: CSSProperties
}
