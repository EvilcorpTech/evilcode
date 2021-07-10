import {Logger} from '@eviljs/std/logger.js'
import {createContext, useContext} from 'react'

export const LoggerContext = createContext<Logger>(void undefined as any)

LoggerContext.displayName = 'LoggerContext'

/*
* EXAMPLE
*
* const logger = createLogger()
* const main = WithLogger(MyMain, logger)
*
* render(<main/>, document.body)
*/
export function WithLogger(Child: React.ElementType, logger: Logger) {
    function LoggerProviderProxy(props: any) {
        return withLogger(<Child {...props}/>, logger)
    }

    return LoggerProviderProxy
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const logger = createLogger()
*     const main = withLogger(<Main/>, logger)
*
*     return main
* }
*/
export function withLogger(children: React.ReactNode, logger: Logger) {
    return (
        <LoggerContext.Provider value={logger}>
            {children}
        </LoggerContext.Provider>
    )
}

/*
* EXAMPLE
*
* export function MyMain(props) {
*     const logger = createLogger()
*
*     return (
*         <LoggerProvider logger={logger}>
*             <MyApp/>
*         </LoggerProvider>
*     )
* }
*/
export function LoggerProvider(props: LoggerProviderProps) {
    return withLogger(props.children, props.logger)
}

export function useLogger() {
    return useContext(LoggerContext)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerProviderProps {
    children: React.ReactNode
    logger: Logger
}
