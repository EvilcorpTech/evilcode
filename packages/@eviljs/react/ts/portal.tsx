import {useContext, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'
import {Box, type BoxProps} from './box.js'
import {defineContext} from './ctx.js'
import type {StateManager} from './state.js'

export const PortalContext: React.Context<undefined | StateManager<null | PortalElement>> = defineContext<StateManager<null | PortalElement>>('PortalContext')

export function PortalProvider(props: PortalProviderProps): React.JSX.Element {
    const {children} = props
    const contextValue = usePortalProvider()

    return <PortalContext value={contextValue} children={children}/>
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
export function Portal(props: PortalProps): React.JSX.Element {
    const [, setPortal] = useContext(PortalContext)!

    return <Box {...props} ref={setPortal}/>
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
export function Teleport(props: TeleportProps): undefined | React.ReactPortal {
    const {children} = props
    const [portal] = useContext(PortalContext)!

    if (! portal) {
        return
    }

    return createPortal(children, portal)
}

export function usePortalProvider(): StateManager<null | PortalElement> {
    const [element, setElement] = useState<null | PortalElement>(null)

    return useMemo(() => [element, setElement], [element, setElement])
}

// Types ///////////////////////////////////////////////////////////////////////

export type PortalElement = Element

export interface PortalProviderProps {
    children: undefined | React.ReactNode
}

export interface PortalProps extends BoxProps {
}

export interface TeleportProps {
    children: React.JSX.Element
}
