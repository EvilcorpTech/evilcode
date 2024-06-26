import type {FnArgs, FnAsync} from '@eviljs/std/fn-type.js'
import {resultOf} from '@eviljs/std/result.js'
import {useCallback} from 'react'
import {useAsyncIo, type AsyncIoManager} from './async-io.js'

export {useAsyncIoAggregated as useRequestsAggregated} from './async-io.js'

export function useRequest<A extends FnArgs, R>(asyncTask: FnAsync<A, R>): RequestManager<A, R> {
    const ioManager = useAsyncIo(asyncTask)

    const send = useCallback((...args: A) => {
        return ioManager.call(...args).then(resultOf)
    }, [ioManager.call])

    return {...ioManager, send, response: ioManager.output}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RequestManager<A extends FnArgs, R> extends AsyncIoManager<A, R> {
    response: AsyncIoManager<A, R>['output']
    send(...args: A): Promise<undefined | R>
}
