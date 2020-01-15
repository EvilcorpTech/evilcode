import { createContext, createElement, useContext } from 'react'
import { Logger } from '@eviljs/std-lib/logger'

export const LoggerContext = createContext<Logger>(void undefined as any)

export function useLogger() {
    return useContext(LoggerContext)
}

export function LoggerProvider(props: LoggerProviderProps) {
    const { logger, children } = props

    return (
        <LoggerContext.Provider value={logger}>
            {children}
        </LoggerContext.Provider>
    )
}

export function withLogger(Child: React.ComponentType, logger: Logger) {
    function LoggerWrapper(props: any) {
        return (
            <LoggerProvider logger={logger}>
                <Child {...props}/>
            </LoggerProvider>
        )
    }

    return LoggerWrapper
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerProviderProps {
    children?: React.ReactNode
    logger: Logger
}