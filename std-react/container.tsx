import { createContext, createElement, useContext } from 'react'
import { Container } from '@eviljs/std-lib/container'

export const ContainerContext = createContext<Container>(void undefined as any)

export function useContainer() {
    return useContext(ContainerContext)
}

export function WithContainer(Child: React.ElementType, container: Container) {
    function ContainerProviderProxy(props: any) {
        return providingContainer(<Child {...props}/>, container)
    }

    return ContainerProviderProxy
}

export function ContainerProvider(props: ContainerProviderProps) {
    return providingContainer(props.children, props.container)
}

export function providingContainer(children: JSX.Element, container: Container) {
    return (
        <ContainerContext.Provider value={container}>
            {children}
        </ContainerContext.Provider>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerProviderProps {
    children: JSX.Element
    container: Container
}
