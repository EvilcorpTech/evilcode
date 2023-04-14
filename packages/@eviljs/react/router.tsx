import type {Fn, ValueComputable} from '@eviljs/std/fn.js'
import {computeValue} from '@eviljs/std/fn.js'
import {escapeRegexp} from '@eviljs/std/regexp.js'
import {asArray, isPromise} from '@eviljs/std/type.js'
import {exact, regexpFromPattern} from '@eviljs/web/route.js'
import type {Router as RouterManager, RouterObserver, RouterRoute, RouterRouteChange, RouterRouteChangeParams, RouterRouteParams} from '@eviljs/web/router.js'
import {encodeLink} from '@eviljs/web/router.js'
import {isAbsoluteUrl} from '@eviljs/web/url.js'
import {Children, forwardRef, isValidElement, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {classes} from './classes.js'
import {defineContext} from './ctx.js'

export {All, Arg, End, Path, PathGlob, PathOpt, Start, Value, exact} from '@eviljs/web/route.js'
export {createHashRouter, createMemoryRouter, createPathRouter} from '@eviljs/web/router.js'
export type {RouterMemoryOptions, RouterObserver, RouterOptions} from '@eviljs/web/router.js'

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
        for (const pattern of asArray(is)) {
            const routeMatches = matchRoute(pattern)

            if (routeMatches) {
                return routeMatches.slice(1) // Without whole match.
            }
        }

        return // Makes TypeScript happy.
    }, [is, matchRoute])

    if (! routeArgs) {
        return null
    }

    return (
        <RouteMatchContext.Provider value={routeArgs}>
            {computeValue(children, ...routeArgs)}
        </RouteMatchContext.Provider>
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
            for (const pattern of asArray(child.props.is)) {
                const routeMatches = matchRoute(pattern)

                if (routeMatches) {
                    return {
                        child: child.props.children,
                        args: routeMatches.slice(1), // Without whole match.
                    }
                }
            }
        }

        return {child: fallback, args: []}
    }, [children, matchRoute])

    return (
        <RouteMatchContext.Provider value={match.args}>
            {computeValue(match.child, ...match.args)}
        </RouteMatchContext.Provider>
    )
}

export function CaseRoute(props: CaseRouteProps) {
    return null
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
        replace: replaceOptional,
        state,
        to,
        ...otherProps
    } = props
    const {changeRoute, link, route, testRoute} = useRouter()!

    const onClick = useCallback((event: React.MouseEvent) => {
        event.preventDefault()

        function tryRouting(result: undefined | boolean) {
            if (result === false) {
                // Routing is blocked only in case of false return value.
                return
            }

            const replace = replaceOptional ?? false

            changeRoute({path: to, params, state, replace})
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

    const activeClasses = false
        || activeClass
        || activeProps?.className
        || RouteActiveClassDefault

    return (
        <a
            onClick={onClick} // It should be possible to change the onClick behavior.
            {...otherProps}
            ref={ref}
            className={classes(className, {
                [activeClasses]: isActive,
            })}
            href={link(to ?? route.path, params)}
        >
            {children}
        </a>
    )
})

export function Link(props: LinkProps) {
    const {children, className, params, replace, state, to, ...otherProps} = props
    const isLink = isAbsoluteUrl(to)

    if (to && isLink) {
        return (
            <a
                target="_blank"
                {...otherProps}
                className={classes('Link-b705 link', className)}
                href={encodeLink(to, params)}
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
            replace={replace}
        >
            {children}
        </Route>
    )
}

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

    return <>{children}</>
}

export function useRootRouter<S = unknown>(routerFactory: RouterFactory<S>): Router<S> {
    const [route, setRoute] = useState(() => {
        return routerFactory(() => {}).route
    })

    const routerManager = useMemo(() => {
        return routerFactory(setRoute)
    }, [routerFactory])

    useEffect(() => {
        routerManager.start()

        setRoute(routerManager.route)

        function onClean() {
            routerManager.stop()
        }

        return onClean
    }, [routerManager])

    const changeRoute = useCallback((args: RouterRouteChangeComputable<S>) => {
        const {params, ...otherArgs} = args
        const paramsComputed = computeValue(params, routerManager.route.params)

        routerManager.changeRoute({...otherArgs, params: paramsComputed})

        setRoute(routerManager.route)
    }, [routerManager])

    const testRoute = useCallback((pattern: string | RegExp) => {
        return regexpFromPattern(pattern).test(route.path)
    }, [route.path])

    const matchRoute = useCallback((pattern: string | RegExp) => {
        return route.path.match(regexpFromPattern(pattern))
    }, [route.path])

    const router = useMemo((): Router<S> => {
        return {
            route,
            changeRoute,
            testRoute,
            matchRoute,
            link: routerManager.createLink,
            start: routerManager.start,
            stop: routerManager.stop,
        }
    }, [
        routerManager,
        route.path,
        route.params,
        route.state,
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
    route: RouterRoute<S>
    changeRoute(args: RouterRouteChangeComputable<S>): void
    testRoute(pattern: string | RegExp): boolean
    matchRoute(pattern: string | RegExp): null | RegExpMatchArray
    link(path: string, params?: undefined | RouterRouteChangeParams): string
    start(): void
    stop(): void
}

export interface WhenRouteProps {
    children: undefined | RouteMatchChildren
    is: RoutePattern
}

export interface SwitchRouteProps {
    children: undefined | React.ReactNode
    default?: undefined | React.ReactNode
}

export interface CaseRouteProps extends WhenRouteProps {
}

export interface RouteProps extends RoutingProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
    activeClass?: undefined | string
    activeProps?: undefined | {className?: undefined | string}
    activeWhenExact?: undefined | boolean
    children: undefined | React.ReactNode
    if?: undefined | ValueComputable<RouteGuardResult>
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

export type RoutePattern = string | RegExp | Array<string | RegExp>

export type RouteMatchChildren =
    | React.ReactNode
    | Fn<RouteArgs, React.ReactNode>

export type RouteArgs = Array<undefined | string>

export type RouteGuardResult = undefined | boolean | Promise<boolean>

export interface RouteMatch {
    child: undefined | RouteMatchChildren
    args: RouteArgs
}
