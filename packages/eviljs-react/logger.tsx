import type {Logger} from '@eviljs/std/logger.js'
import {useContext} from 'react'
import {defineContext} from './ctx.js'

export const LoggerContext = defineContext<Logger>('LoggerContext')

/*
* EXAMPLE
*
* const logger = createLogger()
* const Main = WithLogger(MyMain, logger)
*
* render(<Main/>, document.body)
*/
export function WithLogger<P extends {}>(Child: React.ComponentType<P>, logger: Logger) {
    function LoggerProviderProxy(props: P) {
        return withLogger(<Child {...props}/>, logger)
    }

    return LoggerProviderProxy
}

/*
* EXAMPLE
*
* const logger = createLogger()
*
* export function MyMain(props) {
*     return withLogger(<Children/>, logger)
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
* const logger = createLogger()
*
* export function MyMain(props) {
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

export function useLogger<T extends undefined | Logger = undefined | Logger>() {
    return useContext(LoggerContext) as T
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerProviderProps {
    children: React.ReactNode
    logger: Logger
}
