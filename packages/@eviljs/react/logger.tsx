import type {Logger} from '@eviljs/std/logger.js'
import {useContext} from 'react'
import {defineContext} from './ctx.js'

export const LoggerContext = defineContext<Logger>('LoggerContext')

/*
* EXAMPLE
*
* const logger = createLogger()
*
* export function MyMain(props) {
*     return (
*         <LoggerProvider value={logger}>
*             <MyApp/>
*         </LoggerProvider>
*     )
* }
*/
export function LoggerProvider(props: LoggerProviderProps) {
    const {value, children} = props

    return (
        <LoggerContext.Provider value={value} children={children}/>
    )
}

export function useLogger<T extends Logger = Logger>() {
    return useContext(LoggerContext) as undefined | T
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LoggerProviderProps {
    children: undefined | React.ReactNode
    value: Logger
}
