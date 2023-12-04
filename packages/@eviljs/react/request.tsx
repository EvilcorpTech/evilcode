import type {FnArgs, FnAsync} from '@eviljs/std/fn.js'
import {filterResult} from '@eviljs/std/result.js'
import {useCallback, useContext} from 'react'
import {useAsyncIo, type AsyncIoManager} from './async-io.js'

export {asBaseUrl, joinUrlPath} from '@eviljs/web/url.js'
export {useAsyncIoAggregated as useRequestsAggregated} from './async-io.js'

export function useRequest<A extends FnArgs, R>(asyncTask: FnAsync<A, R>): RequestManager<A, R> {
    const ioManager = useAsyncIo(asyncTask)

    const send = useCallback((...args: A) => {
        return ioManager.call(...args).then(filterResult)
    }, [ioManager.call])

    return {...ioManager, send, response: ioManager.output}
}

export function createRequest<C>(context: React.Context<undefined | C>) {
    function useRequestBound<A extends FnArgs, R>(asyncTask: FnAsync<[C, ...A], R>): RequestManager<A, R> {
        const contextValue = useContext(context)!

        const asyncTaskBound = useCallback((...args: A) => {
            return asyncTask(contextValue, ...args)
        }, [asyncTask, contextValue])

        const ioManager = useRequest(asyncTaskBound)

        const send = useCallback((...args: A) => {
            return ioManager.call(...args).then(filterResult)
        }, [ioManager.call])

        return {...ioManager, send, response: ioManager.output}
    }

    return useRequestBound
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RequestProviderProps {
    children: undefined | React.ReactNode
    value: unknown
}

export interface RequestManager<A extends FnArgs, R> extends AsyncIoManager<A, R> {
    response: AsyncIoManager<A, R>['output']
    send(...args: A): Promise<undefined | R>
}
