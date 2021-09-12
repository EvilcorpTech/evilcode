import {createElement, createContext, useContext, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

export const PortalsContext = createContext<[Portals, PortalMutator]>([{}, () => void null])

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
    const elRef = useRef<null | PortalElement>(null)
    const [portals, setPortals] = usePortals()
    const elTag = tag ?? 'div'
    const elProps = {...otherProps, ref: elRef}

    useEffect(() => {
        const el = elRef.current

        if (! el) {
            return
        }

        setPortals(state => ({
            ...state,
            [name]: el,
        }))

        function unmount() {
            setPortals(state => ({
                ...state,
                [name]: null,
            }))
        }

        return unmount
    }, [name, tag])

    return createElement(elTag, elProps)
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
    const [portals] = usePortals()
    const portal = portals[to]

    if (! portal) {
        return null
    }

    return createPortal(children, portal)
}

export function usePortals() {
    return useContext(PortalsContext)
}

// Types ///////////////////////////////////////////////////////////////////////

export type Portals = Record<PortalId, PortalElement>
export type PortalId = PropertyKey
export type PortalElement = undefined | null | HTMLElement | SVGElement
export type PortalMutator = React.Dispatch<React.SetStateAction<Portals>>

export interface PortalsProviderProps {
    children?: React.ReactNode
}

export interface PortalProps extends React.HTMLAttributes<PortalElement> {
    tag?: keyof React.ReactDOM
    name: PortalId
    [key: string]: unknown
}

export interface TeleportProps {
    children: React.ReactNode
    to: PortalId
}
