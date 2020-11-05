import {useRouteMatches} from '../router.js'
import React from 'react'
const {cloneElement, Children, Fragment} = React

export function Router(props: RouterProps) {
    const {map, children} = props
    const matches = useRouteMatches()
    const routedProps: Record<string, string | undefined> = {}

    for (const it of map) {
        const {prop, match} = it
        routedProps[prop] = matches?.[match]
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

export interface RouterProps {
    map: Array<{
        prop: string
        match: number
    }>
    children: React.ReactElement | Array<React.ReactElement>
}
