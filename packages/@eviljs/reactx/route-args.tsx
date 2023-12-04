import {useRouteArgs, useRoutePathTest} from '@eviljs/react/router.js'
import {isArray, isFunction} from '@eviljs/std/type.js'
import {routeRegexpFromPattern} from '@eviljs/web/route.js'
import {Children, cloneElement, useMemo} from 'react'

export function RouteArgs(props: RouteArgsProps) {
    const {route, fromProp, guard, children, ...otherProps} = props
    const {testRoutePath} = useRoutePathTest()
    const routeArgs = useRouteArgs()

    const routeIsValid = useMemo(() => {
        if (! guard) {
            return true
        }
        const guardRegexp = routeRegexpFromPattern(guard)
        const isValid = testRoutePath(guardRegexp)

        return isValid
    }, [guard, testRoutePath])

    if (! children) {
        return
    }

    if (! routeIsValid) {
        // Skips mapping if current route does not match the pattern.
        // Useful when rendering a component being unmounted, inside a transition.
        return children
    }

    const args = fromProp
        ? otherProps[fromProp]
        : routeArgs

    const routedProps = (() => {
        if (isArray(route)) {
            const props: Record<string, any> = {}

            for (const it of route) {
                const {fromArg, toProp, map} = it
                const value = args?.[fromArg]

                props[toProp] = map
                    ? map(value)
                    : value
            }

            return props
        }

        if (isFunction(route)) {
            return route(args)
        }

        return {}
    })()

    return (
        // We use a fragment for typing reasons.
        <>
            {Children.map(children, it =>
                cloneElement(it, routedProps)
            )}
        </>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouteArgsProps {
    children: React.ReactElement | Array<React.ReactElement>
    fromProp?: undefined | string
    guard?: undefined | string | RegExp
    route:
        | Array<{
            fromArg: number
            toProp: string
            map?(arg: undefined | string): any
        }>
        | ((args: Array<string>) => Record<string, any>)
    [key: string]: any
}
