import {filterResult} from '@eviljs/std/result.js'
import {useCallback, useContext} from 'react'
import {defineContext} from './ctx.js'
import {useAsyncIo, type AsyncIoManager} from './io.js'

export {asBaseUrl, joinUrlPath} from '@eviljs/web/url.js'
export {useAsyncIoAggregated as useRequestsAggregated} from './io.js'

export const RequestContext = defineContext('RequestContext')

/*
* EXAMPLE
*
* const adapter = createRequest(createFetch({baseUrl: '/api'}))
*
* export function MyMain(props) {
*     return (
*         <RequestProvider value={adapter}>
*             <MyApp/>
*         </RequestProvider>
*     )
* }
*/
export function RequestProvider(props: RequestProviderProps) {
    const {children, value} = props

    return <RequestContext.Provider value={value} children={children}/>
}

export function useRequestContext<C>() {
    return useContext<C>(RequestContext as React.Context<C>)
}

export function useRequest<C, A extends Array<unknown>, R>(asyncTask: RequestIo<C, A, R>): RequestManager<A, R> {
    const context = useRequestContext<C>()

    const asyncIo = useCallback((...args: A): Promise<R> => {
        return asyncTask(context, ...args)
    }, [asyncTask])

    const ioManager = useAsyncIo(asyncIo)

    const send = useCallback((...args: A) => {
        return ioManager.call(...args).then(filterResult)
    }, [asyncIo.call])

    return {...ioManager, send, response: ioManager.output}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RequestProviderProps {
    children: undefined | React.ReactNode
    value: unknown
}

export interface RequestManager<A extends Array<unknown>, R> extends AsyncIoManager<A, R> {
    response: AsyncIoManager<A, R>['output']
    send(...args: A): Promise<undefined | R>
}

export interface RequestIo<C, A extends Array<unknown>, R> {
    (context: C, ...args: A): Promise<R>
}
