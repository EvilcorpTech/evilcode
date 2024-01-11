import {compute, type Computable} from '@eviljs/std/compute.js'
import type {Fn, Task} from '@eviljs/std/fn.js'
import {escapeRegexp} from '@eviljs/std/regexp.js'
import {asArray, isPromise, isString} from '@eviljs/std/type.js'
import {exact, matchRoutePattern, testRoutePattern, type RoutePattern, type RoutePatterns} from '@eviljs/web/route.js'
import type {RouterRoute, RouterRouteChange, RouterRouteChangeParams, RouterRouteParams} from '@eviljs/web/router.js'
import {encodeLink} from '@eviljs/web/router.js'
import {isUrlAbsolute} from '@eviljs/web/url.js'
import {Children, forwardRef, isValidElement, useCallback, useContext, useEffect, useMemo, useRef} from 'react'
import {classes} from './classes.js'
import {defineContext} from './ctx.js'
import {displayName} from './display-name.js'
import {useComputedRefValue} from './reactive-ref.js'
import {useRouterContext} from './router-provider.js'

export * from '@eviljs/web/route-v2.js'
export * from '@eviljs/web/route.js'
export * from '@eviljs/web/router.js'
export * from './router-provider.js'

export const RouteMatchContext = defineContext<RouteArgs>('RouteMatchContext')

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
    const {matchRoutePath} = useRoutePathTest()

    const routeArgs = useMemo((): undefined | RouteArgs => {
        for (const pattern of asArray(is)) {
            const routeMatches = matchRoutePath(pattern)

            if (! routeMatches) {
                continue
            }

            return routeMatches.slice(1) // Without whole match.
        }

        return // Makes TypeScript happy.
    }, [is, matchRoutePath])

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
* <SwitchRoute fallback={() => <NotFoundView/>}>
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
    const {routePath, matchRoutePath} = useRoutePathTest()

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
                const routeMatches = matchRoutePath(pattern)

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
            child: compute(fallback, routePath),
            args: [],
        }
    }, [children, matchRoutePath, routePath])

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
export const Route = displayName('Route', forwardRef(function Route(
    props: RouteProps,
    ref: React.ForwardedRef<HTMLAnchorElement>
) {
    const {
        activeWhenExact,
        className,
        if: guard,
        params,
        replace: replaceOptional,
        state,
        to,
        ...otherProps
    } = props
    const {changeRoute, link} = useRouter()
    const {testRoutePath} = useRoutePathTest()
    const routePath = useRoutePath()
    const hrefPath = to ?? routePath

    const href = useMemo(() => {
        return link(hrefPath, params)
    }, [hrefPath, params])

    const active = useMemo(() => {
        if (! to) {
            return false
        }

        const pathEscaped = escapeRegexp(to)
        const pathExact = activeWhenExact
            ? exact(pathEscaped)
            : pathEscaped

        return testRoutePath(pathExact)
    }, [to, testRoutePath])

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

    return (
        <a
            // Overwritable properties.
            data-active={active}
            onClick={onClick}
            {...otherProps}
            ref={ref}
            className={classes('Route-84a4', className)}
            href={href}
        />
    )
}))

export const Link = displayName('Link', forwardRef(function Link(
    props: LinkProps,
    ref: React.ForwardedRef<HTMLAnchorElement>
) {
    const {className, params, replace, state, to, ...otherProps} = props
    const isLink = isString(to) && isUrlAbsolute(to)

    if (isLink) {
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
}))

export function Redirect(props: RedirectProps) {
    const {children, params, replace: replaceOptional, state, to: path} = props
    const {changeRoute} = useRouter()
    const replace = replaceOptional ?? true

    useEffect(() => {
        if (! path && ! params) {
            return
        }

        changeRoute({path, params, state, replace})
    }, [])

    return children
}

export function useRouter<S = unknown>(): RouterManager<S> {
    const routerContext = useRouterContext<S>()!

    const readRoute = useRouteRead<S>()

    const changeRoute = useCallback((args: RouterRouteChangeComputable<S>) => {
        const {params, ...otherArgs} = args
        const paramsComputed = compute(params, readRoute().params)

        routerContext.changeRoute({...otherArgs, params: paramsComputed})
    }, [routerContext, readRoute])

    const link = useRouterLink()

    return {
        changeRoute,
        link,
        readRoute,
    }
}

export function useRouterLink() {
    const routerContext = useRouterContext()!

    return routerContext.createLink
}

export function useRoute<S = unknown>(): RouteManager<S> {
    return {
        routePath: useRoutePath(),
        routeParams: useRouteParams(),
        routeState: useRouteState<S>(),
        routeArgs: useRouteArgs(),
    }
}

export function useRouteRead<S = unknown>(): Task<RouterRoute<S>> {
    const routerContext = useRouterContext<S>()!

    const readRoute = useCallback(() => {
        return routerContext.route.value
    }, [routerContext])

    return readRoute
}

export function useRoutePath(): RouterRoute['path'] {
    const routerContext = useRouterContext()!

    const compute = useCallback((route: RouterRoute) => {
        return route.path
    }, [])

    const routePath = useComputedRefValue(routerContext.route, compute)

    return routePath
}

export function useRouteParams(): RouterRoute['params'] {
    const routerContext = useRouterContext()!

    const compute = useCallback((route: RouterRoute) => {
        return route.params
    }, [])

    const routeParams = useComputedRefValue(routerContext.route, compute)

    return routeParams
}

export function useRouteState<S = unknown>(): RouterRoute<S>['state'] {
    const routerContext = useRouterContext<S>()!

    const compute = useCallback((route: RouterRoute<S>) => {
        return route.state
    }, [])

    const routeState = useComputedRefValue(routerContext.route, compute)

    return routeState
}

export function useRouteArgs() {
    return useContext(RouteMatchContext)!
}

export function useRoutePathTest(): RoutePathTester {
    const routePath = useRoutePath()

    const testRoutePath = useCallback((pattern: RoutePattern) => {
        return testRoutePattern(routePath, pattern)
    }, [routePath])

    const matchRoutePath = useCallback((pattern: RoutePattern) => {
        return matchRoutePattern(routePath, pattern)
    }, [routePath])

    return {
        routePath,
        testRoutePath,
        matchRoutePath,
    }
}

export function useRouteTransition() {
    const routePath = useRoutePath()
    const toRoute = routePath
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

export interface RouteArgsProviderProps {
    children: undefined | React.ReactNode
    value: RouteArgs
}

export interface WhenRouteProps {
    children: undefined | RouteMatchChildren
    is: RoutePatterns
}

export interface SwitchRouteProps {
    children: undefined | React.ReactNode
    fallback?: undefined | Computable<React.ReactNode, [RouterRoute['path']]>
}

export interface CaseRouteProps extends WhenRouteProps {
    key?: undefined | React.Key
}

export interface RouteProps extends RoutingProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
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

export interface RouterManager<S = unknown> {
    changeRoute(args: RouterRouteChangeComputable<S>): void
    link(path: string, params?: undefined | RouterRouteChangeParams): string
    readRoute(): RouterRoute<S>
}

export interface RouteManager<S = unknown> {
    routePath: RouterRoute<S>['path']
    routeParams: RouterRoute<S>['params']
    routeState: RouterRoute<S>['state']
    routeArgs: RouteArgs
}

export interface RoutePathTester {
    routePath: RouterRoute['path']
    testRoutePath(pattern: RoutePattern): boolean
    matchRoutePath(pattern: RoutePattern): undefined | RegExpMatchArray
}

export interface RouterRouteChangeComputable<S = unknown> extends Omit<RouterRouteChange<S>, 'params'> {
    params?: undefined | Computable<
        undefined | RouterRouteChangeParams,
        [routeParams: undefined | RouterRouteParams]
    >
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
