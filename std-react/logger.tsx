import { createContext, createElement, useContext } from 'react'
import { Logger } from '@eviljs/std-lib/logger'

export const LoggerContext = createContext<Logger>(void undefined as any)

export function useLogger() {
    return useContext(LoggerContext)
}

export function WithLogger(Child: React.ElementType, logger: Logger) {
    function LoggerProviderProxy(props: any) {
        return providingLogger(<Child {...props}/>, logger)
    }

    return LoggerProviderProxy
}

export function LoggerProvider(props: LoggerProviderProps) {
    return providingLogger(props.children, props.logger)
}

export function providingLogger(children: JSX.Element, logger: Logger) {
    return (
        <LoggerContext.Provider value={logger}>
            {children}
        </LoggerContext.Provider>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerProviderProps {
    children: JSX.Element
    logger: Logger
}
