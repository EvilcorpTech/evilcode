import React from 'react'
import {useRouteMatches} from '../router.js'
const {cloneElement, Children, Fragment} = React

export function RouteArgs(props: RouteArgsProps) {
    const {map, children} = props
    const matches = useRouteMatches()
    const routedProps: Record<string, string | undefined> = {}

    if (! children) {
        return null
    }

    for (const it of map) {
        const {arg, prop} = it
        routedProps[prop] = matches?.[arg]
    }

    const mappedChildren = Children.map(children, (it) => {
        const props = {
            ...it.props,
            ...routedProps,
        }
        return cloneElement(it, props)
    })

    return (
        <Fragment>
            {mappedChildren}
        </Fragment>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouteArgsProps {
    map: Array<{
        arg: number
        prop: string
    }>
    children: React.ReactElement | Array<React.ReactElement>
}
