import {createElement, createContext, memo, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

export const PortalContext = createContext<null | PortalElement>(null)

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
export function withPortal(render?: PortalProviderChild) {
    const [portal, setPortal] = useState<null | PortalElement>(null)

    function Portal(props: PortalProps) {
        const {tag, ...otherProps} = props
        const portalRef = useRef<null | PortalElement>(null)

        const elTag = tag ?? 'div'
        const elProps = {...otherProps, ref: portalRef}

        useEffect(() => {
            setPortal(portalRef.current)
        })

        return createElement(elTag, elProps)
    }

    const PortalMemo = useMemo(() => {
        return memo(Portal)
    }, [])

    return (
        <PortalContext.Provider value={portal}>
            {render?.(PortalMemo)}
        </PortalContext.Provider>
    )
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
    const portal = useContext(PortalContext)

    if (! portal) {
        return null
    }

    return createPortal(children, portal)
}

// Types ///////////////////////////////////////////////////////////////////////

export type PortalElement = HTMLElement | SVGElement

export interface PortalProviderProps {
    children?: PortalProviderChild
}

export interface PortalProviderChild {
    (portal: React.ComponentType<PortalProps>): React.ReactNode
}

export interface PortalProps extends React.HTMLAttributes<PortalElement> {
    tag?: keyof React.ReactDOM
    [key: string]: unknown
}

export interface TeleportProps {
    children: JSX.Element
}
