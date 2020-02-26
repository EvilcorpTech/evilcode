import { createContext, createElement, useContext } from 'react'
import { Container } from '@eviljs/std-lib/container'

export const ContainerContext = createContext<Container>(void undefined as any)

export function useContainer() {
    return useContext(ContainerContext)
}

export function ContainerProvider(props: ContainerProviderProps) {
    const { container, children } = props

    return (
        <ContainerContext.Provider value={container}>
            {children}
        </ContainerContext.Provider>
    )
}

export function withContainer(Child: React.ElementType, container: Container) {
    function ContainerWrapper(props: any) {
        return (
            <ContainerProvider container={container}>
                <Child {...props} />
            </ContainerProvider>
        )
    }

    return ContainerWrapper
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ContainerProviderProps {
    children?: React.ReactNode
    container: Container
}
