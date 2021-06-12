import {Container} from '@eviljs/std/container.js'
import React from 'react'
const {createContext, useContext} = React

export const ContainerContext = createContext<Container>(void undefined as any)

ContainerContext.displayName = 'ContainerContext'

/*
* EXAMPLE
*
* const spec = {services}
* const container = createContainer(spec)
* const main = WithContainer(MyMain, container)
*
* render(<main/>, document.body)
*/
export function WithContainer(Child: React.ElementType, container: Container) {
    function ContainerProviderProxy(props: any) {
        return withContainer(<Child {...props}/>, container)
    }

    return ContainerProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {services}
*     const container = createContainer(spec)
*     const main = withContainer(<Main/>, container)
*
*     return main
* }
*/
export function withContainer(children: React.ReactNode, container: Container) {
    return (
        <ContainerContext.Provider value={container}>
            {children}
        </ContainerContext.Provider>
    )
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const spec = {services}
*     const container = createContainer(spec)
*
*     return (
*         <ContainerProvider container={container}>
*             <MyApp/>
*         </ContainerProvider>
*     )
* }
*/
export function ContainerProvider(props: ContainerProviderProps) {
    return withContainer(props.children, props.container)
}

export function useContainer() {
    return useContext(ContainerContext)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerProviderProps {
    children: React.ReactNode
    container: Container
}
