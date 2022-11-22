import {createElement, useContext, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import type {Tag} from './box.js'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'

export const PortalsContext = defineContext<StateManager<Portals>>('PortalsContext')

/*
* EXAMPLE
*
* return (
*     <PortalsProvider>
*         <Portal name="main"/>
*
*         <Teleport to="main">
*             <p>This code is teleported inside the Portal</p>
*         </Teleport>
*     </PortalsProvider>
* )
*/
export function PortalsProvider(props: PortalsProviderProps) {
    return (
        <PortalsContext.Provider value={useRootPortals()}>
            {props.children}
        </PortalsContext.Provider>
    )
}

/*
* EXAMPLE
*
* return (
*     <PortalsProvider>
*         <Portal name="main"/>
*
*         <Teleport to="main">
*             <p>This code is teleported inside the Portal</p>
*         </Teleport>
*     </PortalsProvider>
* )
*/
export function Portal(props: PortalProps) {
    const {name, tag, ...otherProps} = props
    const portalRef = useRef<null | PortalElement>(null)
    const [portals, setPortals] = useContext(PortalsContext)!

    useEffect(() => {
        const el = portalRef.current

        if (! el) {
            return
        }

        setPortals(state => ({
            ...state,
            [name]: el,
        }))

        function onClean() {
            setPortals(state => ({
                ...state,
                [name]: null,
            }))
        }

        return onClean
    }, [name, tag])

    return createElement(tag ?? 'div', {...otherProps, ref: portalRef})
}

/*
* EXAMPLE
*
* return (
*     <PortalsProvider>
*         <Portal name="main"/>
*
*         <Teleport to="main">
*             <p>This code is teleported inside the Portal</p>
*         </Teleport>
*     </PortalsProvider>
* )
*/
export function Teleport(props: TeleportProps) {
    const {to, children} = props
    const [portals] = useContext(PortalsContext)!
    const portal = portals[to]

    if (! portal) {
        return null
    }

    return createPortal(children, portal)
}

export function useRootPortals() {
    return useState<Portals>({})
}

// Types ///////////////////////////////////////////////////////////////////////

export type PortalElement = HTMLElement
export type Portals = Record<PortalId, null | PortalElement>
export type PortalId = PropertyKey

export interface PortalsProviderProps {
    children?: undefined | React.ReactNode
}

export interface PortalProps extends React.HTMLAttributes<PortalElement> {
    tag?: undefined | Tag
    name: PortalId
    [key: string]: unknown
}

export interface TeleportProps {
    children: React.ReactNode
    to: PortalId
}
