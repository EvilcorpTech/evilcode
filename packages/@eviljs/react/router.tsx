import {compute, type Computable} from '@eviljs/std/compute.js'
import type {Fn} from '@eviljs/std/fn.js'
import {escapeRegexp} from '@eviljs/std/regexp.js'
import {asArray, isPromise} from '@eviljs/std/type.js'
import {exact, matchRoutePattern, testRoutePattern, type RoutePathTest} from '@eviljs/web/route.js'
import type {Router as RouterManager, RouterRoute, RouterRouteChange, RouterRouteChangeParams, RouterRouteParams} from '@eviljs/web/router.js'
import {encodeLink} from '@eviljs/web/router.js'
import {isUrlAbsolute} from '@eviljs/web/url.js'
import {Children, forwardRef, isValidElement, useCallback, useContext, useEffect, useMemo, useRef} from 'react'
import {classes} from './classes.js'
import {defineContext} from './ctx.js'
import {useReactiveRef} from './reactive.js'

export * from '@eviljs/web/route-v2.js'
export * from '@eviljs/web/route.js'
export * from '@eviljs/web/router.js'

export const RouterContext = defineContext<Router>('RouterContext')
export const RouteMatchContext = defineContext<RouteArgs>('RouteMatchContext')
export const RouteActiveClassDefault = 'route-active'

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
    const value = useRouterCreator(router)

    return <RouterContext.Provider value={value} children={children}/>
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
* <WhenRoute is={MatchStart+'/book'+MatchEnd}>
*     <h1>/book exact</h1>
* </WhenRoute>
* <WhenRoute is={exact('/book')}>
*     <h1>/book exact</h1>
* </WhenRoute>
* <WhenRoute is={new RegExp('^/book(?:/)?$', 'i')}>
*     <h1>/book</h1>
* </WhenRoute>
* <WhenRoute is={`${MatchStart}/book/${Arg}/${Arg}${MatchEnd}`}>
*     {(arg1, arg2) =>
*         <h1>/book/{arg1}/{arg2}</h1>
*     }
* </WhenRoute>
*/
export function WhenRoute(props: WhenRouteProps) {
    const {children, is} = props
    const {matchRoute} = useRouter()!

    const routeArgs = useMemo((): undefined | RouteArgs => {
        for (const pattern of asArray(is)) {
            const routeMatches = matchRoute(pattern)

            if (! routeMatches) {
                continue
            }

            return routeMatches.slice(1) // Without whole match.
        }

        return // Makes TypeScript happy.
    }, [is, matchRoute])

    if (! routeArgs) {
        return
    }

    return (
        <RouteMatchContext.Provider value={routeArgs}>
            {compute(children, ...routeArgs)}
        </RouteMatchContext.Provider>
    )
}

/*
* EXAMPLE
*
* <SwitchRoute fallback={<NotFoundView/>}>
*     <CaseRoute is={new RegExp(`^/book/${Arg}/${Arg}`, 'i')}>
*         {(arg1, arg2) => (
*             <h1>/book/{arg1}/{arg2}</h1>
*         )}
*     </CaseRoute>
*     <CaseRoute is={MatchStart+'/book'+MatchEnd}>
*         <h1>/book exact</h1>
*     </CaseRoute>
*     <CaseRoute is={exact('/book')}>
*         <h1>/book exact</h1>
*     </CaseRoute>
*     <CaseRoute is={'^/book'}>
*         <h1>/book*</h1>
*     </CaseRoute>
*     <CaseRoute is={'^/$'}>
*         <h1>/ exact</h1>
*     </CaseRoute>
*     <CaseRoute is={'^/'}>
*         <h1>/*</h1>
*     </CaseRoute>
* </SwitchRoute>
*/
export function SwitchRoute(props: SwitchRouteProps) {
    const {children, fallback} = props
    const {matchRoute} = useRouter()!

    interface RouteMatch {
        key: undefined | React.Key
        child: undefined | RouteMatchChildren
        args: RouteArgs,
    }

    const match = useMemo((): RouteMatch => {
        const candidates = Children.toArray(children).filter(isCaseRouteElement)

        for (const candidate of candidates) {
            const candidatePatterns = asArray(candidate.props.is)

            for (const pattern of candidatePatterns) {
                const routeMatches = matchRoute(pattern)

                if (! routeMatches) {
                    continue
                }

                return {
                    key: candidate.key ?? undefined,
                    child: candidate.props.children,
                    args: routeMatches.slice(1), // Without whole match.
                }
            }
        }

        return {
            key: undefined,
            child: fallback,
            args: [],
        }
    }, [children, matchRoute])

    const {key, args} = match
    const child = compute(match.child, ...args)

    return <RouteMatchContext.Provider key={key} value={args} children={child}/>
}

export function CaseRoute(props: CaseRouteProps): undefined {
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
* <Route params={{...route.params, id: 123}}>
*     <button>Click</button>
* </Route>`
*/
export const Route = forwardRef(function Route(
    props: RouteProps,
    ref: React.ForwardedRef<HTMLAnchorElement>
) {
    const {
        activeClass: activeClassOptional,
        activeProps,
        activeWhenExact,
        className,
        if: guard,
        params,
        replace: replaceOptional,
        state,
        to,
        ...otherProps
    } = props
    const {changeRoute, link, route, testRoute} = useRouter()!

    const onClick = useCallback((event: React.MouseEvent) => {
        if (event.defaultPrevented) {
            // Default behavior has been prevented. We must stop.
            return
        }

        event.preventDefault()

        function tryRouting(result: undefined | boolean) {
            if (result === false) {
                // Routing is blocked only in case of false return value.
                return
            }

            const replace = replaceOptional ?? false

            changeRoute({path: to, params, state, replace})
        }

        const guardResult = compute(guard)

        if (isPromise(guardResult)) {
            // Async behavior.
            guardResult.then(tryRouting)
        }
        else {
            // Sync behavior.
            tryRouting(guardResult)
        }
    }, [changeRoute, to, params, state, replaceOptional, guard])

    const isActive = useMemo(() => {
        if (! to) {
            return false
        }

        const pathEscaped = escapeRegexp(to)
        const pathExact = activeWhenExact
            ? exact(pathEscaped)
            : pathEscaped

        return testRoute(pathExact)
    }, [to, testRoute])

    const activeClass = undefined
        ?? activeClassOptional
        ?? activeProps?.className
        ?? RouteActiveClassDefault

    return (
        <a
            onClick={onClick} // It should be possible to change the onClick behavior.
            {...otherProps}
            ref={ref}
            className={classes(className, {
                [activeClass]: isActive,
            })}
            href={link(to ?? route.path, params)}
        />
    )
})
Route.displayName = 'Route'

export const Link = forwardRef(function Link(
    props: LinkProps,
    ref: React.ForwardedRef<HTMLAnchorElement>
) {
    const {className, params, replace, state, to, ...otherProps} = props
    const isLink = isUrlAbsolute(to)

    if (to && isLink) {
        return (
            <a
                target="_blank"
                {...otherProps}
                ref={ref}
                className={classes('Link-b705 link', className)}
                href={encodeLink(to, params)}
            />
        )
    }

    return (
        <Route
            {...otherProps}
            ref={ref}
            className={classes('Link-b705 route', className)}
            to={to}
            params={params}
            state={state}
            replace={replace}
        />
    )
})
Link.displayName = 'Link'

export function Redirect(props: RedirectProps) {
    const {children, params, replace: replaceOptional, state, to: path} = props
    const {changeRoute} = useRouter()!
    const replace = replaceOptional ?? true

    useEffect(() => {
        if (! path && ! params) {
            return
        }

        changeRoute({path, params, state, replace})
    })

    return children
}

export function useRouterCreator<S = unknown>(routerAdapter: RouterManager<S>): Router<S> {
    const [route, setRoute] = useReactiveRef(routerAdapter.route)

    useEffect(() => {
        routerAdapter.start()

        setRoute(routerAdapter.route.value)

        function onClean() {
            routerAdapter.stop()
        }

        return onClean
    }, [routerAdapter])

    const readRoute = useCallback(() => {
        return routerAdapter.route.value
    }, [routerAdapter])

    const changeRoute = useCallback((args: RouterRouteChangeComputable<S>) => {
        const {params, ...otherArgs} = args
        const paramsComputed = compute(params, readRoute().params)

        routerAdapter.changeRoute({...otherArgs, params: paramsComputed})

        setRoute(readRoute())
    }, [routerAdapter, readRoute])

    const testRoute = useCallback((pattern: string | RegExp) => {
        return testRoutePattern(route.path, pattern)
    }, [route.path])

    const matchRoute = useCallback((pattern: string | RegExp) => {
        return matchRoutePattern(route.path, pattern)
    }, [route.path])

    const router = useMemo((): Router<S> => {
        return {
            route,
            readRoute,
            changeRoute,
            testRoute,
            matchRoute,
            link: routerAdapter.createLink,
            start: routerAdapter.start,
            stop: routerAdapter.stop,
        }
    }, [
        routerAdapter,
        route.path,
        route.params,
        route.state,
        readRoute,
        changeRoute,
        testRoute,
        matchRoute,
    ])

    return router
}

export function useRouter() {
    return useContext(RouterContext)
}

export function useRouteArgs() {
    return useContext(RouteMatchContext)
}

export function useRouterTransition() {
    const {route} = useRouter()!
    const toRoute = route.path
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

function isCaseRouteElement(element: unknown): element is React.ReactElement<CaseRouteProps, typeof CaseRoute> {
    if (! isValidElement(element)) {
        return false
    }
    if (element.type !== CaseRoute) {
        return false
    }
    return true
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouterProviderProps<S = unknown> {
    children: undefined | React.ReactNode
    router: RouterManager<S>
}

export interface RouteArgsProviderProps {
    children: undefined | React.ReactNode
    value: RouteArgs
}

export interface Router<S = unknown> {
    route: RouterRoute<S>
    readRoute(): RouterRoute<S>
    changeRoute(args: RouterRouteChangeComputable<S>): void
    testRoute(pattern: string | RegExp): boolean
    matchRoute(pattern: string | RegExp): undefined | RegExpMatchArray
    link(path: string, params?: undefined | RouterRouteChangeParams): string
    start(): void
    stop(): void
}

export interface WhenRouteProps {
    children: undefined | RouteMatchChildren
    is: RoutePathTest
}

export interface SwitchRouteProps {
    children: undefined | React.ReactNode
    fallback?: undefined | React.ReactNode
}

export interface CaseRouteProps extends WhenRouteProps {
    key?: undefined | React.Key
}

export interface RouteProps extends RoutingProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
    activeClass?: undefined | string
    activeProps?: undefined | {className?: undefined | string}
    activeWhenExact?: undefined | boolean
    children: undefined | React.ReactNode
    if?: undefined | Computable<RouteGuardResult>
}

export interface LinkProps extends RoutingProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: undefined | React.ReactNode
}

export interface RedirectProps extends RoutingProps {
    children?: undefined | React.ReactNode
}

export interface RoutingProps extends Omit<RouterRouteChange, 'path'> {
    to?: undefined | RouterRouteChange['path']
}

export interface RouterRouteChangeComputable<S = unknown> extends Omit<RouterRouteChange<S>, 'params'> {
    params?:
        | undefined
        | RouterRouteChangeParams
        | ((params: RouterRouteParams) => RouterRouteChangeParams)
}

export type RouteMatchChildren =
    | React.ReactNode
    | Fn<RouteArgs, React.ReactNode>

export type RouteArgs = Array<undefined | string>

export type RouteGuardResult = undefined | boolean | Promise<boolean>

export interface RouteMatch {
    child: undefined | RouteMatchChildren
    args: RouteArgs
}
