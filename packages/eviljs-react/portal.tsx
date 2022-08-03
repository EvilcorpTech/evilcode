import {createContext, createElement, useContext, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

export const PortalContext = createContext<[null | PortalElement, PortalMutator]>([null, () => void undefined])

PortalContext.displayName = 'PortalContext'

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
*             <Portal tag="section"/>
*         </Fragment>
*     }/>
* )
*/
export function PortalProvider(props: PortalProviderProps) {
    return withPortal(props.children)
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
export function withPortal(children: React.ReactNode) {
    const portal = useState<null | PortalElement>(null)

    return (
        <PortalContext.Provider value={portal}>
            {children}
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
    const [portal, setPortal] = useContext(PortalContext)

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
    const [portal] = useContext(PortalContext)

    if (! portal) {
        return null
    }

    return createPortal(children, portal)
}

// Types ///////////////////////////////////////////////////////////////////////

export type PortalElement = HTMLElement
export type PortalMutator = React.Dispatch<React.SetStateAction<null | PortalElement>>

export interface PortalProviderProps {
    children?: undefined | React.ReactNode
}

export interface PortalProps extends React.HTMLAttributes<PortalElement> {
    tag?: undefined | keyof React.ReactHTML
    [key: string]: unknown
}

export interface TeleportProps {
    children: JSX.Element
}
