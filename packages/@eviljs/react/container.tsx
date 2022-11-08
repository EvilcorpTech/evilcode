import type {Container} from '@eviljs/std/container.js'
import {useContext} from 'react'
import {defineContext} from './ctx.js'

export const ContainerContext = defineContext<Container>('ContainerContext')

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

export function useContainer<T extends undefined | Container = undefined | Container>() {
    return useContext(ContainerContext) as T
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerProviderProps {
    children: React.ReactNode
    container: Container
}
