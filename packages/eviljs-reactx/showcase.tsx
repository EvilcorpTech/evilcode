import {Box, BoxProps} from '@eviljs/react/box.js'
import {Route, useRouter} from '@eviljs/react/router.js'
import {classes} from '@eviljs/web/classes.js'
import {createElement, useEffect, useMemo, useState} from 'react'

export function Showcase(props: ShowcaseProps) {
    const {children, className, ...otherProps} = props
    const [selected, setSelected] = useState('')
    const [search, setSearch] = useState('')
    const router = useRouter()
    const {replaceRoute, routeParams, routePath} = router

    useEffect(() => {
        const defaultShowcase = children[0]
        const defaultId = defaultShowcase
            ? idForShowcase(defaultShowcase)
            : ''

        setSelected(routeParams.id ?? defaultId)
    }, [routeParams.id])

    useEffect(() => {
        setSearch(routeParams.search ?? '')
    }, [routeParams.search])

    const items = useMemo(() => {
        const matchingItems = children.filter(it =>
            it[0].toLowerCase().includes(search.toLowerCase())
        )
        return matchingItems
    }, [search])

    const selectedItem = children.find(it => idForShowcase(it) === selected)
        ?? children[0]
    const selectedComponent = selectedItem?.[1]

    return (
        <Box
            {...otherProps}
            className={classes('Showcase-d1c8', className)}
        >
            <nav className="navigation-70eb std-shadow z2">
                <input
                    className="input-0caa std-text-body2"
                    value={search}
                    placeholder="Search something..."
                    onChange={event =>
                        replaceRoute(routePath, {
                            ...routeParams,
                            search: event.target.value ?? '',
                        })
                    }
                />

                <i className="std-space-v s4"/>

                {items.map((it, idx) =>
                    <Route
                        key={idx}
                        className={classes('item-988a', {
                            selected: idForShowcase(it) === selected,
                        })}
                        to={routePath}
                        params={{...routeParams, id: idForShowcase(it)}}
                    >
                        {it[0]}
                    </Route>
                )}
            </nav>

            <div className="workspace-a486">
                {selectedComponent && createElement(selectedComponent)}
            </div>
        </Box>
    )
}

export function defineShowcase(title: string, component: React.ComponentType): ShowcaseModel {
    return [title, component]
}

export function idForShowcase(item: ShowcaseModel) {
    const [title] = item
    return title
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ShowcaseProps extends BoxProps {
    children: Array<ShowcaseModel>
}

export type ShowcaseModel = [string, React.ComponentType]
