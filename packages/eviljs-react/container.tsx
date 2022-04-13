import {Container} from '@eviljs/std/container.js'
import {createContext, useContext} from 'react'

export const ContainerContext = createContext<unknown>(undefined)

ContainerContext.displayName = 'ContainerContext'

/*
* EXAMPLE
*
* const spec = {services}
* const container = createContainer(spec)
* const Main = WithContainer(MyMain, container)
*
* render(<Main/>, document.body)
*/
export function WithContainer<P extends {}>(Child: React.ComponentType<P>, container: Container) {
    function ContainerProviderProxy(props: P) {
        return withContainer(<Child {...props}/>, container)
    }

    return ContainerProviderProxy
}

/*
* EXAMPLE
*
* const spec = {services}
* const container = createContainer(spec)
*
* export function MyMain(props) {
*     return withContainer(<Child/>, container)
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
* const spec = {services}
* const container = createContainer(spec)
*
* export function MyMain(props) {
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

export function useContainer<T = Container>() {
    return useContext<T>(ContainerContext as React.Context<T>)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerProviderProps {
    children: React.ReactNode
    container: Container
}
