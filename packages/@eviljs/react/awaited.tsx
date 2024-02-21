import {compute, type Computable} from '@eviljs/std/fn.js'
import {useLayoutEffect, useState} from 'react'

export function Awaited<V>(props: AwaitedProps<V>) {
    const {children, promise, pending} = props
    const promiseState = useAwaited(promise)

    if (promiseState?.stage !== 'fulfilled') {
        return compute(pending)
    }
    return children(promiseState.result)
}

export function useAwaited<V>(promise: undefined | Promise<V>): undefined | AwaitedPromiseState<V> {
    const [registry, setRegistry] = useState<AwaitedPromiseMap<V>>(() => new Map())

    useLayoutEffect(() => {
        if (! promise) {
            return
        }

        function createRegistry(promise: Promise<V>, promiseState: AwaitedPromiseState<V>): AwaitedPromiseMap<V> {
            return new Map([[promise, promiseState]])
        }

        // Rejection must be handled with an Error Boundary.
        promise.then(result => setRegistry(createRegistry(promise, {stage: 'fulfilled', result})))
    }, [promise])

    if (! promise) {
        return
    }

    return registry.get(promise)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AwaitedProps<V> {
    children(result: V): React.ReactNode
    pending?: undefined | Computable<React.ReactNode>
    promise: undefined | Promise<V>
}

export type AwaitedPromiseMap<V> = Map<Promise<V>, AwaitedPromiseState<V>>

export type AwaitedPromiseState<V> =
    | {
        stage: 'fulfilled'
        result: V
    }
