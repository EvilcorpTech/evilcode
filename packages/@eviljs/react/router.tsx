import type {Fn, ValueComputable} from '@eviljs/std/fn.js'
import {computeValue} from '@eviljs/std/fn.js'
import {escapeRegexp} from '@eviljs/std/regexp.js'
import {isPromise} from '@eviljs/std/type.js'
import {exact, regexpFromPattern} from '@eviljs/web/route.js'
import type {Router as RouterManager, RouterObserver, RouterParams, RouterRouteParams} from '@eviljs/web/router.js'
import {serializeRouteToString} from '@eviljs/web/router.js'
import {Children, forwardRef, isValidElement, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {classes} from './classes.js'
import {defineContext} from './ctx.js'

export {All, Arg, End, exact, Path, PathGlob, PathOpt, Start, Value} from '@eviljs/web/route.js'
export {createHashRouter, createMemoryRouter, createPathRouter} from '@eviljs/web/router.js'
export type {RouterMemoryOptions, RouterObserver, RouterOptions} from '@eviljs/web/router.js'

export const RouterContext = defineContext<Router>('RouterContext')
export const RouteArgsContext = defineContext<RouteArgs>('RouteArgsContext')
export const RouteDefaultActiveClass = 'route-active'

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
    const {children, createRouter} = props

    return (
        <RouterContext.Provider value={useRootRouter(createRouter)}>
            {children}
        </RouterContext.Provider>
    )
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
    const {children, default: fallback} = props
    const {matchRoute} = useRouter()!

    interface RouteMatch {child: undefined | RouteMatchChildren, args: RouteArgs}

    const match = useMemo((): RouteMatch => {
        const childrenList = Children.toArray(children).filter(isCaseRouteElement)

        for (const child of childrenList) {
            const routeMatches = matchRoute(child.props.is)

            if (! routeMatches) {
                continue
            }

            return {
                child: child.props.children,
                args: routeMatches.slice(1), // Without whole match.
            }
        }

        return {child: fallback, args: []}
    }, [children, matchRoute])

    return (
        <RouteArgsContext.Provider value={match.args}>
            {computeValue(match.child, ...match.args)}
        </RouteArgsContext.Provider>
    )
}

export function CaseRoute(props: CaseRouteProps) {
    return null
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
    const {matchRoute} = useRouter()!

    const routeArgs = useMemo((): undefined | RouteArgs => {
        const routeMatches = matchRoute(is)

        if (! routeMatches) {
            return
        }

        return routeMatches.slice(1) // Without whole match.
    }, [is, matchRoute])

    if (! routeArgs) {
        return null
    }

    return (
        <RouteArgsContext.Provider value={routeArgs}>
            {computeValue(children, ...routeArgs)}
        </RouteArgsContext.Provider>
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
export const Route = forwardRef(function Route(
    props: RouteProps,
    ref?: undefined | React.Ref<HTMLAnchorElement>,
) {
    const {
        activeClass,
        activeProps,
        activeWhenExact,
        children,
        className,
        if: guard,
        params,
        replace,
        state,
        to,
        ...otherProps
    } = props
    const {link, replaceRoute, routeTo, testRoute} = useRouter()!

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

        return testRoute(path)
    }, [to, testRoute])

    const activeClasses = false
        || activeClass
        || activeProps?.className
        || RouteDefaultActiveClass

    return (
        <a
            onClick={onClick} // It should be possible to change the onClick behavior.
            {...otherProps}
            ref={ref}
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
})

export function Link(props: LinkProps) {
    const {children, className, to, params, state, ...otherProps} = props
    const isRoute = to?.startsWith('/')

    if (! isRoute) {
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

export function Redirect(props: RedirectProps) {
    const {to, params, state, replace} = props
    const {replaceRoute, routeTo} = useRouter()!
    const shouldReplace = replace ?? true

    useEffect(() => {
        if (! to) {
            return
        }

        if (shouldReplace) {
            replaceRoute(to, params, state)
        }
        else {
            routeTo(to, params, state)
        }
    })

    return null
}

export function useRootRouter<S>(routerFactory: RouterFactory<S>): Router<S> {
    const routerManager = useMemo(() => {
        function onRouteChange(path: string, params: RouterRouteParams, state: any) {
            setRoute({path, params, state})
        }

        return routerFactory(onRouteChange)
    }, [routerFactory])

    const [route, setRoute] = useState(() => routerManager.route)

    useEffect(() => {
        routerManager.start()

        function onClean() {
            routerManager.stop()
        }

        return onClean
    }, [routerManager])

    const router = useMemo((): Router<S> => {
        return {
            routePath: route.path,
            routeParams: route.params,
            routeState: route.state,
            routeTo(path, params, state) {
                routerManager.routeTo(path, params, state)
                setRoute(routerManager.route)
            },
            replaceRoute(path, params, state) {
                routerManager.replaceRoute(path, params, state)
                setRoute(routerManager.route)
            },
            testRoute(pattern) {
                return regexpFromPattern(pattern).test(route.path)
            },
            matchRoute(pattern) {
                return route.path.match(regexpFromPattern(pattern))
            },
            link: routerManager.link,
            start: routerManager.start,
            stop: routerManager.stop,
        }
    }, [
        routerManager,
        route.path,
        route.params,
        route.state,
    ])

    return router
}

export function useRouter() {
    return useContext(RouterContext)
}

export function useRouteArgs() {
    return useContext(RouteArgsContext)
}

export function useRouterTransition() {
    const {routePath: toRoute} = useRouter()!
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

export interface RouterProviderProps {
    children: undefined | React.ReactNode
    createRouter: RouterFactory
}

export interface RouteArgsProviderProps {
    children: undefined | React.ReactNode
    value: RouteArgs
}

export interface RouterFactory<S = any> {
    (observer: RouterObserver<S>): RouterManager<S>
}

export interface Router<S = unknown> {
    routePath: string
    routeParams: RouterRouteParams
    routeState: undefined | S
    routeTo(path: string, params?: undefined | RouterParams, state?: undefined | S): void
    replaceRoute(path: string, params?: undefined | RouterParams, state?: undefined | S): void
    testRoute(pattern: string | RegExp): boolean
    matchRoute(pattern: string | RegExp): null | RegExpMatchArray
    link(path: string, params?: undefined | RouterParams): string
    start(): void
    stop(): void
}

export interface SwitchRouteProps {
    children: undefined | React.ReactNode
    default?: undefined | React.ReactNode
}

export interface CaseRouteProps {
    children: undefined | RouteMatchChildren
    is: string | RegExp
}

export interface WhenRouteProps {
    children: undefined | RouteMatchChildren
    is: string | RegExp
}

export interface RouteProps extends RoutingProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
    activeClass?: undefined | string
    activeProps?: undefined | {className?: undefined | string}
    activeWhenExact?: undefined | boolean
    children: undefined | React.ReactNode
    if?: undefined | ValueComputable<RouteGuardResult>
    replace?: undefined | boolean
}

export interface LinkProps extends RoutingProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: undefined | React.ReactNode
}

export interface RedirectProps extends RoutingProps {
    replace?: undefined | boolean
}

export interface RoutingProps {
    params?: undefined | RouterParams
    state?: undefined | any
    to: undefined | string
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
