import {isArray, isFunction} from '@eviljs/std/type.js'
import {regexpFromPattern} from '@eviljs/web/route.js'
import {Children, cloneElement, Fragment, useMemo} from 'react'
import {useRouter, useRouteMatches} from './router.js'

export function RouteArgs(props: RouteArgsProps) {
    const {route, fromProp, guard, children, ...otherProps} = props
    const {testRoute} = useRouter()
    const matches = useRouteMatches()

    const routeIsValid = useMemo(() => {
        if (! guard) {
            return true
        }
        const guardRegexp = regexpFromPattern(guard)
        const isValid = testRoute(guardRegexp)

        return isValid
    }, [guard, testRoute])

    if (! children) {
        return null
    }

    if (! routeIsValid) {
        // Skips mapping if current route does not match the pattern.
        // Useful when rendering an component being unmounted, inside a transition.
        // We use a fragment for typing reasons.
        return <Fragment>{children}</Fragment>
    }


    const args = fromProp
        ? otherProps[fromProp]
        : matches

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

    const mappedChildren = Children.map(children, (it) =>
        cloneElement(it, {
            ...it.props,
            ...routedProps,
        })
    )

    return (
        // We use a fragment for typing reasons.
        <Fragment>
            {mappedChildren}
        </Fragment>
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
