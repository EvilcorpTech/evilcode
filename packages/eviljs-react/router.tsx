import {escapeRegExp} from '@eviljs/std/regexp.js'
import {asArray, isFunction, isPromise, Nil} from '@eviljs/std/type.js'
import {classes} from './react.js'
import {compilePattern, exact, regexpFromPattern} from '@eviljs/web/route.js'
import {createRouter, serializeRouteToString, RouterOptions, RouterParams, RouterRouteParams} from '@eviljs/web/router.js'
import {createContext, cloneElement, useCallback, useContext, useEffect, useMemo, useRef, useState, Fragment, Children, CSSProperties} from 'react'

export {exact, All, Arg, End, Value, Path, PathOpt, PathGlob, Start} from '@eviljs/web/route.js'

export const RouterContext = createContext<Router>(void undefined as any)
export const RouteMatchesContext = createContext<RouteMatches>(void undefined as any)
export const RouteDefaultActiveClass = 'route-active'

RouterContext.displayName = 'RouterContext'
RouteMatchesContext.displayName = 'RouteMatchContext'

/*
* EXAMPLE
*
* const options = {type, basePath}
* const Main = WithRouter(MyMain, options)
*
* render(<Main/>, document.body)
*/
export function WithRouter<P extends {}>(Child: React.ComponentType<P>) {
    function RouterProviderProxy(props: P) {
        return withRouter(<Child {...props}/>)
    }

    return RouterProviderProxy
}

/*
* EXAMPLE
*
* const options = {type, basePath}
*
* export function MyMain(props) {
*     return withRouter(<Child/>, options)
* }
*/
export function withRouter(children: React.ReactNode, options?: undefined | RouterOptions) {
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
export function withRouteMatches(matches: RouteMatches, children?: undefined | React.ReactNode) {
    return (
        <RouteMatchesContext.Provider value={matches}>
            {children}
        </RouteMatchesContext.Provider>
    )
}

/*
* EXAMPLE
*
* const MyComponentMatcher = createRouteMatches(<MyComponent/>)
*
* function App() {
*     return (
*         <WhenRoute is={`^/book/${Arg}/${Arg}`}>
*             <MyComponentMatcher/>
*         </WhenRoute>
*     )
* }
*
* function App() {
*     return (
*         <SwitchRoute default={<NotFoundView/>}>
*         {[
*             {is: `^/book/${Arg}/${Arg}`, then: <MyComponentMatcher/>},
*         ]}
*         </SwitchRoute>
*     )
* }
*/
export function createRouteMatches(children?: undefined | React.ReactNode) {
    function routeMatchesProxy(...matches: RouteMatches) {
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
*         <RouteMatchProvider value={[arg1, arg2]}>
*             <MyComponent/>
*         </RouteMatchProvider>
*     )},
* ]}
* </SwitchRoute>
*/
export function RouteMatchProvider(props: RouteMatchProviderProps) {
    return withRouteMatches(props.value, props.children)
}

export function useRootRouter(options?: undefined | RouterOptions) {
    const globalRouter = useMemo(() => {
        return createRouter(onRouteChange, options)
    }, [])
    const [route, setRoute] = useState(() => globalRouter.route)

    const testRoute = useCallback((pattern: RegExp) => {
        return pattern.test(route.path)
    }, [route.path])

    const matchRoute = useCallback((pattern: RegExp) => {
        return route.path.match(pattern)
    }, [route.path])

    const routeTo = useCallback((path: string, params?: undefined | RouterParams, state?: undefined | any) => {
        globalRouter.routeTo(path, params, state)
        setRoute(globalRouter.route)
    }, [globalRouter])

    const replaceRoute = useCallback((path: string, params?: undefined | RouterParams, state?: undefined | any) => {
        globalRouter.replaceRoute(path, params, state)
        setRoute(globalRouter.route)
    }, [globalRouter])

    useEffect(() => {
        globalRouter.start()

        function unmount() {
            globalRouter.stop()
        }

        return unmount
    }, [globalRouter])

    const router = useMemo(() => {
        const routePath = route.path
        const routeParams = route.params
        const routeState = route.state
        const {link, start, stop} = globalRouter

        return {
            routePath,
            routeParams,
            routeState,
            routeTo,
            replaceRoute,
            testRoute,
            matchRoute,
            link,
            start,
            stop,
        }
    }, [
        globalRouter,
        route.path,
        route.params,
        route.state,
        routeTo,
        replaceRoute,
        testRoute,
        matchRoute,
    ])

    function onRouteChange(path: string, params: RouterRouteParams, state: any) {
        setRoute({path, params, state})
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
    const {
        activeClass,
        activeWhenExact,
        children,
        className,
        elRef,
        if: guard,
        params,
        replace,
        state,
        to,
        ...otherProps
    } = props
    const {link, replaceRoute, routeTo, testRoute} = useRouter()

    const onClick = useCallback((event: React.MouseEvent) => {
        event.preventDefault()

        function tryRouting(response: Nil | boolean) {
            if (! to) {
                return
            }

            if (response === false) {
                // Routing is blocked only in case of false return value.
                return
            }

            const action = replace
                ? replaceRoute
                : routeTo

            action(to, params, state)
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
    }, [routeTo, to, params, state, guard, replace])

    const isActive = useMemo(() => {
        if (! to) {
            return false
        }

        const escapedTo = escapeRegExp(to)
        const path = activeWhenExact
            ? exact(escapedTo)
            : escapedTo
        const pathRe = regexpFromPattern(path)

        return testRoute(pathRe)
    }, [to, testRoute])

    return (
        <a
            {...otherProps}
            ref={elRef}
            className={classes(className, {
                [activeClass ?? RouteDefaultActiveClass]: isActive,
            })}
            href={to
                ? link(to, params)
                : undefined
            }
            onClick={onClick}
        >
            {children}
        </a>
    )
}

export function Link(props: LinkProps) {
    const {children, className, to, params, state, ...otherProps} = props
    const isRoute = to?.startsWith('/')

    if (isRoute) {
        return (
            <Route
                {...otherProps}
                className={classes('Link-b705 route', className)}
                to={to}
                params={params}
                state={state}
            >
                {children}
            </Route>
        )
    }

    return (
        <a
            target="_blank"
            {...otherProps}
            className={classes('Link-b705 link', className)}
            href={to
                ? serializeRouteToString(to, params)
                : undefined
            }
        >
            {children}
        </a>
    )
}

export function Redirect(props: RedirectProps) {
    const {to, params, state, replace} = props
    const {replaceRoute, routeTo} = useRouter()
    const shouldReplace = replace ?? true

    useEffect(() => {
        shouldReplace
            ? replaceRoute(to, params, state)
            : routeTo(to, params, state)
    })

    return null
}

export function renderRouteChildren(
    then: Nil | RouteMatchChildren,
    matches: Nil | RouteMatches,
    props: RouteChildrenProps,
    render?: undefined | RouteRenderProps['render'],
) {
    const children: React.ReactNode = isFunction(then)
        ? then(...matches)
        : then

    if (! children) {
        return null
    }

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

export function cleanMatches(matches: null | RegExpMatchArray) {
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
    value: Array<string>
}

export interface Router<S = any> {
    routePath: string
    routeParams: RouterRouteParams
    routeState: Nil | S
    routeTo(path: string, params?: undefined | RouterParams, state?: Nil | S): void
    replaceRoute(path: string, params?: undefined | RouterParams, state?: Nil | S): void
    testRoute(pattern: RegExp): boolean
    matchRoute(pattern: RegExp): null | RegExpMatchArray
    link(path: string, params?: undefined | RouterParams): string
    start(): void
    stop(): void
}

export interface SwitchRouteProps extends RouteRenderProps, Omit<React.AllHTMLAttributes<Element>, 'default'> {
    children: SwitchRouteChildren | Array<SwitchRouteChildren>
    default?: undefined | React.ReactNode
    [key: string]: any
}

export interface WhenRouteProps extends RouteRenderProps, Omit<React.AllHTMLAttributes<Element>, 'is'> {
    children: RouteMatchChildren
    is: string | RegExp
    [key: string]: any
}

export interface RouteProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children?: undefined | React.ReactNode
    elRef?: undefined | React.Ref<HTMLAnchorElement>
    to?: undefined | string
    params?: undefined | RouterParams
    state?: undefined | any
    replace?: undefined | boolean
    if?(): undefined | boolean | Promise<boolean>
    activeWhenExact?: undefined | boolean
    activeClass?: undefined | string
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode
    to?: undefined | string
    params?: undefined | RouterParams
    state?: undefined | any
}

export interface RedirectProps {
    to: string
    params?: undefined | RouterParams
    state?: undefined | any
    replace?: undefined | boolean
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
    className?: undefined | string
    style?: undefined | CSSProperties
}
