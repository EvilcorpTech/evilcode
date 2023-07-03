import type {BoxProps} from '@eviljs/react/box.js'
import {Box} from '@eviljs/react/box.js'
import {Route, useRouter} from '@eviljs/react/router.js'
import {classes} from '@eviljs/react/classes.js'
import {createElement, useEffect, useMemo, useState} from 'react'

export function Showcase(props: ShowcaseProps) {
    const {children, className, ...otherProps} = props
    const [selected, setSelected] = useState('')
    const [search, setSearch] = useState('')
    const {changeRoute, route} = useRouter()!

    useEffect(() => {
        const defaultShowcase = children[0]
        const defaultId = defaultShowcase
            ? idOfShowcase(defaultShowcase)
            : ''

        setSelected(route.params?.id ?? defaultId)
    }, [route.params?.id])

    useEffect(() => {
        setSearch(route.params?.search ?? '')
    }, [route.params?.search])

    const items = useMemo(() => {
        const matchingItems = children.filter(it =>
            it[0].toLowerCase().includes(search.toLowerCase())
        )
        return matchingItems
    }, [search])

    const selectedItem = children.find(it => idOfShowcase(it) === selected)
        ?? children[0]
    const selectedComponent = selectedItem?.[1]

    return (
        <Box
            {...otherProps}
            className={classes('Showcase-d1c8', className)}
        >
            <nav className="navigation-70eb std-shadow2">
                <input
                    className="input-0caa std-text-body2"
                    value={search}
                    placeholder="Search something..."
                    onChange={event =>
                        changeRoute({
                            params: {
                                ...route.params,
                                search: event.target.value ?? '',
                            },
                            replace: true,
                        })
                    }
                />

                <i className="std-space-v4"/>

                {items.map((it, idx) =>
                    <Route
                        key={idx}
                        className={classes('item-988a', {
                            selected: idOfShowcase(it) === selected,
                        })}
                        to={route.path}
                        params={{...route.params, id: idOfShowcase(it)}}
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

export function idOfShowcase(item: ShowcaseModel) {
    const [title] = item
    return title
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ShowcaseProps extends Omit<BoxProps, 'children'> {
    children: Array<ShowcaseModel>
}

export type ShowcaseModel = [string, React.ComponentType]
