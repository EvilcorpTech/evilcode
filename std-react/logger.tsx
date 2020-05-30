import {createContext, createElement, useContext} from 'react'
import {Logger} from '@eviljs/std-lib/logger'

export const LoggerContext = createContext<Logger>(void undefined as any)

export function useLogger() {
    return useContext(LoggerContext)
}

export function withLogger(children: React.ReactNode, logger: Logger) {
    return (
        <LoggerContext.Provider value={logger}>
            {children}
        </LoggerContext.Provider>
    )
}

export function LoggerProvider(props: LoggerProviderProps) {
    return withLogger(props.children, props.logger)
}

export function WithLogger(Child: React.ElementType, logger: Logger) {
    function LoggerProviderProxy(props: any) {
        return withLogger(<Child {...props}/>, logger)
    }

    return LoggerProviderProxy
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerProviderProps {
    children: React.ReactNode
    logger: Logger
}
