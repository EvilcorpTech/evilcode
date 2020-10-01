import {createContext, createElement, useContext} from 'react'
import {Container} from '@eviljs/std-lib/container.js'

export const ContainerContext = createContext<Container>(void undefined as any)

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
*     const main = withContainer(<MyMain/>, container)
*
*     return <main/>
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
