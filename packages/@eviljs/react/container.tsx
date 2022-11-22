import type {Container} from '@eviljs/std/container.js'
import {useContext} from 'react'
import {defineContext} from './ctx.js'

export const ContainerContext = defineContext<Container>('ContainerContext')

/*
* EXAMPLE
*
* const spec = {services}
* const container = createContainer(spec)
*
* export function MyMain(props) {
*     return (
*         <ContainerProvider value={container}>
*             <MyApp/>
*         </ContainerProvider>
*     )
* }
*/
export function ContainerProvider(props: ContainerProviderProps) {
    return (
        <ContainerContext.Provider value={props.value}>
            {props.children}
        </ContainerContext.Provider>
    )
}

export function useContainer<T extends Container = Container>() {
    return useContext(ContainerContext) as undefined | T
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerProviderProps {
    children: undefined | React.ReactNode
    value: Container
}
