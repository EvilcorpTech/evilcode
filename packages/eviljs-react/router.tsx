import {ComputableValue, computeValue} from '@eviljs/std/fn.js'
import {escapeRegexp} from '@eviljs/std/regexp.js'
import {asArray, isPromise, Nil} from '@eviljs/std/type.js'
import {classes} from './classes.js'
import {compilePattern, exact, regexpFromPattern} from '@eviljs/web/route.js'
import {createRouter, serializeRouteToString, RouterOptions, RouterParams, RouterRouteParams} from '@eviljs/web/router.js'
import {createContext, CSSProperties, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'

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
export function withRouteMatches(routeMatches: RouteMatches, children?: undefined | React.ReactNode) {
    return (
        <RouteMatchesContext.Provider value={routeMatches}>
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
    function routeMatchesProxy(...routeMatches: RouteMatches) {
        return withRouteMatches(routeMatches, children)
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

        function onUnmount() {
            globalRouter.stop()
        }

        return onUnmount
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

    useEffect(() => {
        prevRouteRef.current = toRoute
    }, [toRoute])

    const transition = useMemo(() => {
        const fromRoute = prevRouteRef.current
        return {fromRoute, toRoute}
    }, [toRoute])

    return transition
}

/*
* EXAMPLE
*
* <SwitchRoute default={<NotFoundView/>}>
*     <CaseRoute is={new RegExp(`^/book/${Arg}/${Arg}`, 'i')}>
*         {(arg1, arg2) => (
*             <h1>/book/{arg1}/{arg2}</h1>
*         )}
*     </CaseRoute>
*     <CaseRoute is={Start+'/book'+End}>
*         <h1>/book exact</h1>
*     </CaseRoute>
*     <CaseRoute is={exact('/book')}>
*         <h1>/book exact</h1>
*     </CaseRoute>
*     <CaseRoute is={'^/book'}>
*          <h1>/book*</h1>
*     </CaseRoute>
*     <CaseRoute is={'^/$'}>
*          <h1>/ exact</h1>
*     </CaseRoute>
*     <CaseRoute is={'^/'}>
*          <h1>/*</h1>
*     </CaseRoute>
* </SwitchRoute>
*/
export function SwitchRoute(props: SwitchRouteProps) {
    const {children, default: fallback} = props
    const {matchRoute} = useRouter()

    const [matchingChild, matchingRouteArgs] = useMemo(() => {
        if (! children)  {
            return []
        }

        for (const child of asArray(children)) {
            const pathRegexp = compilePattern(child.props.is)
            const matchingRouteArgs = matchRoute(pathRegexp)

            if (! matchingRouteArgs) {
                continue
            }

            return [child.props.children, cleanRouteMatches(matchingRouteArgs)] as (
                [RouteMatchChildren, Array<string>]
            )
        }

        if (fallback) {
            return [fallback, []] as [SwitchRouteProps['default'], Array<string>]
        }

        return []
    }, [children, matchRoute])

    return (
        <Fragment>
            {computeValue(matchingChild, ...matchingRouteArgs)}
        </Fragment>
    )
}

export function CaseRoute(props: CaseRouteProps) {
    const {children} = props

    return <Fragment>{children}</Fragment>
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
* <WhenRoute is={`${Start}/book/${Arg}/${Arg}${End}`}>
*     {(arg1, arg2) =>
*         <h1>/book/{arg1}/{arg2}</h1>
*     }
* </WhenRoute>
*/
export function WhenRoute(props: WhenRouteProps) {
    const {children, is} = props
    const {matchRoute} = useRouter()

    const routeMatches = useMemo(() => {
        const pathRegexp = regexpFromPattern(is)
        const routeMatches = matchRoute(pathRegexp)

        return cleanRouteMatches(routeMatches)
    }, [is, matchRoute])

    return (
        <Fragment>
            {computeValue(children, ...routeMatches)}
        </Fragment>
    )
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
* </Route>`
*/
export function Route(props: RouteProps) {
    const {
        activeClass,
        activeProps,
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

        function tryRouting(result: undefined | boolean) {
            if (! to) {
                return
            }

            if (result === false) {
                // Routing is blocked only in case of false return value.
                return
            }

            const action = replace
                ? replaceRoute
                : routeTo

            action(to, params, state)
        }

        const guardResult = computeValue(guard)

        if (isPromise(guardResult)) {
            // Async behavior.
            guardResult.then(tryRouting)
        }
        else {
            // Sync behavior.
            tryRouting(guardResult)
        }
    }, [routeTo, to, params, state, guard, replace])

    const isActive = useMemo(() => {
        if (! to) {
            return false
        }

        const escapedTo = escapeRegexp(to)
        const path = activeWhenExact
            ? exact(escapedTo)
            : escapedTo
        const pathRegexp = regexpFromPattern(path)

        return testRoute(pathRegexp)
    }, [to, testRoute])

    const activeClasses = false
        || activeClass
        || activeProps?.className
        || RouteDefaultActiveClass

    return (
        <a
            onClick={onClick} // It should be possible to change the onClick behavior.
            {...otherProps}
            ref={elRef}
            className={classes(className, {
                [activeClasses]: isActive,
            })}
            href={to
                ? link(to, params)
                : undefined
            }
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

export function cleanRouteMatches(routeMatches: null | RegExpMatchArray) {
    if (! routeMatches) {
        return []
    }

    return routeMatches.slice(1) // Without the whole match.
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

export interface SwitchRouteProps {
    children?: undefined
        | React.ReactElement<CaseRouteProps, typeof CaseRoute>
        | Array<React.ReactElement<CaseRouteProps, typeof CaseRoute>>
    default?: undefined | React.ReactNode
}

export interface CaseRouteProps {
    children?: undefined | RouteMatchChildren
    is: string | RegExp
}

export interface WhenRouteProps {
    children?: undefined | RouteMatchChildren
    is: string | RegExp
}

export interface RouteProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    activeClass?: undefined | string
    activeProps?: undefined | {className?: undefined | string}
    activeWhenExact?: undefined | boolean
    children?: undefined | React.ReactNode
    elRef?: undefined | React.Ref<HTMLAnchorElement>
    if?: undefined | ComputableValue<RouteGuardResult>
    params?: undefined | RouterParams
    replace?: undefined | boolean
    state?: undefined | any
    to?: undefined | string
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode
    params?: undefined | RouterParams
    state?: undefined | any
    to?: undefined | string
}

export interface RedirectProps {
    params?: undefined | RouterParams
    replace?: undefined | boolean
    state?: undefined | any
    to: string
}

export type RouteGuardResult = undefined | boolean | Promise<boolean>

export type RouteMatchChildren =
    | React.ReactNode
    | ((...routeMatches: RouteMatches) => React.ReactNode)

export interface RouteMatches extends Array<string> {
}

export interface RouteChildrenProps {
    className?: undefined | string
    style?: undefined | CSSProperties
}
