import { createContext, createElement, useContext } from 'react'
import { Container } from '@eviljs/std-lib/container'

export const ContainerContext = createContext<Container>(void undefined as any)

export function useContainer() {
    return useContext(ContainerContext)
}

export function withContainer(children: React.ReactNode, container: Container) {
    return (
        <ContainerContext.Provider value={container}>
            {children}
        </ContainerContext.Provider>
    )
}

export function ContainerProvider(props: ContainerProviderProps) {
    return withContainer(props.children, props.container)
}

export function WithContainer(Child: React.ElementType, container: Container) {
    function ContainerProviderProxy(props: any) {
        return withContainer(<Child {...props}/>, container)
    }

    return ContainerProviderProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerProviderProps {
    children: React.ReactNode
    container: Container
}
