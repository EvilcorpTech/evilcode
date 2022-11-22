import {createElement, useContext, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import type {Tag} from './box.js'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'

export const PortalContext = defineContext<StateManager<null | PortalElement>>('PortalContext')

export function PortalProvider(props: PortalProviderProps) {
    return (
        <PortalContext.Provider value={useRootPortal()}>
            {props.children}
        </PortalContext.Provider>
    )
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return withPortal(Portal =>
*         <Fragment>
*             <Teleport>
*                 <p>This code is teleported inside the Portal</p>
*             </Teleport>
*
*             <Portal/>
*         </Fragment>
*     )
* }
*/
export function Portal(props: PortalProps) {
    const {tag, ...otherProps} = props
    const portalRef = useRef<null | PortalElement>(null)
    const [portal, setPortal] = useContext(PortalContext)!

    useEffect(() => {
        setPortal(portalRef.current)
    }, [tag])

    return createElement(tag ?? 'div', {...otherProps, ref: portalRef})
}

/*
* EXAMPLE
*
* return (
*     <PortalProvider children={Portal =>
*         <Fragment>
*             <Teleport>
*                 <p>This code is teleported inside the Portal</p>
*             </Teleport>
*
*             <Portal/>
*         </Fragment>
*     }/>
* )
*/
export function Teleport(props: TeleportProps) {
    const {children} = props
    const [portal] = useContext(PortalContext)!

    if (! portal) {
        return null
    }

    return createPortal(children, portal)
}

export function useRootPortal() {
    return useState<null | PortalElement>(null)
}

// Types ///////////////////////////////////////////////////////////////////////

export type PortalElement = HTMLElement

export interface PortalProviderProps {
    children: undefined | React.ReactNode
}

export interface PortalProps extends React.HTMLAttributes<PortalElement> {
    tag?: undefined | Tag
    [key: string]: unknown
}

export interface TeleportProps {
    children: JSX.Element
}
