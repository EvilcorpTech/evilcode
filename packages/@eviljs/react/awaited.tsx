import {compute, type Computable} from '@eviljs/std/compute.js'
import {useMemo, useState} from 'react'

export function Awaited<V>(props: AwaitedProps<V>) {
    const {children, promise, pending} = props
    const promiseState = useAwaited(promise)

    if (! promiseState) {
        return compute(pending)
    }
    if (promiseState.stage === 'fulfilled') {
        return children(promiseState.result)
    }
    return // Makes TypeScript happy.
}

export function useAwaited<V>(promise: undefined | Promise<V>): undefined | AwaitedPromiseState<V> {
    const [registry, setRegistry] = useState<AwaitedPromiseMap<V>>(() => new Map())

    // We must use a useMemo, because an useLayoutEffect
    // can miss the promise resolution/rejection.
    useMemo(() => {
        if (! promise) {
            return
        }

        function createRegistry(promise: Promise<V>, promiseState: AwaitedPromiseState<V>): AwaitedPromiseMap<V> {
            const registry: AwaitedPromiseMap<V> = new Map()
            registry.set(promise, promiseState)
            return registry
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
