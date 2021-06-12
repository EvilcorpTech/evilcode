import {regexpFromPattern} from '@eviljs/web/route.js'
import React from 'react'
import {useRouter, useRouteMatches} from './router.js'
const {cloneElement, useMemo, Children, Fragment} = React

export function RouteArgs(props: RouteArgsProps) {
    const {map, from, if: guard, children, ...otherProps} = props
    const {testRoute} = useRouter()
    const matches = useRouteMatches()

    const routeIsValid = useMemo(() => {
        if (! guard) {
            return true
        }
        const guardRe = regexpFromPattern(guard)
        const isValid = testRoute(guardRe)

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

    const routedProps: Record<string, string | undefined> = {}
    const args = from
        ? otherProps[from]
        : matches

    for (const it of map) {
        const {arg, prop} = it
        routedProps[prop] = args?.[arg]
    }

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
    from?: string
    if?: string | RegExp
    map: Array<{
        arg: number
        prop: string
    }>
    [key: string]: any
}
