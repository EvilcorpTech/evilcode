import {createElement, createContext, useContext, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

export const PortalsContext = createContext<[Portals, PortalsMutator]>([{}, () => void undefined])

PortalsContext.displayName = 'PortalsContext'

/*
* EXAMPLE
*
* const Main = WithPortals(MyMain)
*
* render(<Main/>, document.body)
*/
export function WithPortals<P extends {}>(Child: React.ComponentType<P>) {
    function PortalsProviderProxy(props: P) {
        return withPortals(<Child {...props}/>)
    }

    return PortalsProviderProxy
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
export function PortalsProvider(props: PortalsProviderProps) {
    return withPortals(props.children)
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     return withPortals(
*         <Fragment>
*             <Portal name="main"/>
*
*             <Teleport to="main">
*                 <p>This code is teleported inside the Portal</p>
*             </Teleport>
*         </Fragment>
*     )
* }
*/
export function withPortals(children: React.ReactNode) {
    const portals = useState<Portals>({})

    return (
        <PortalsContext.Provider value={portals}>
            {children}
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
    const [portals, setPortals] = useContext(PortalsContext)

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
    const [portals] = useContext(PortalsContext)
    const portal = portals[to]

    if (! portal) {
        return null
    }

    return createPortal(children, portal)
}

// Types ///////////////////////////////////////////////////////////////////////

export type PortalElement = HTMLElement
export type Portals = Record<PortalId, null | PortalElement>
export type PortalId = PropertyKey
export type PortalsMutator = React.Dispatch<React.SetStateAction<Portals>>

export interface PortalsProviderProps {
    children?: undefined | React.ReactNode
}

export interface PortalProps extends React.HTMLAttributes<PortalElement> {
    tag?: undefined | keyof React.ReactDOM
    name: PortalId
    [key: string]: unknown
}

export interface TeleportProps {
    children: React.ReactNode
    to: PortalId
}
