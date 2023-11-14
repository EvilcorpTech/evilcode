import type {Io} from '@eviljs/std/fn.js'
import {chain} from '@eviljs/std/pipe.js'
import {useMemo, useState} from 'react'

export function Awaited<V>(props: AwaitedProps<V>) {
    const {children, promise, fallback, pending} = props
    const [registry, setRegistry] = useState<PromiseMap>(() => new Map())
    const shouldHandleRejection = Boolean(fallback)

    type PromiseMap = Map<Promise<V>, PromiseState>
    type PromiseState =
        | {
            state: 'fulfilled'
            result: V
        }
        | {
            state: 'rejected'
            error: unknown
        }

    const promiseHandled = useMemo(() => {
        if (! promise) {
            return promise
        }

        function asRegistry(promise: Promise<V>, promiseState: PromiseState) {
            type Key = typeof promise
            type Value = typeof promiseState

            return chain(new Map<Key, Value>(),
                it => it.set(promise, promiseState),
            )
        }

        return promise.then(
            result => {
                setRegistry(asRegistry(promise, {state: 'fulfilled', result}))
            },
            error => {
                if (! shouldHandleRejection) {
                    throw error
                }

                setRegistry(asRegistry(promise, {state: 'rejected', error}))
            },
        )
    }, [promise])

    if (! promise) {
        return
    }

    const promiseState = registry.get(promise)

    if (! promiseState) {
        return pending
    }

    if (promiseState.state === 'rejected') {
        return fallback?.(promiseState.error)
    }

    if (promiseState.state === 'fulfilled') {
        return children(promiseState.result)
    }

    return // Makes TypeScript happy.
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AwaitedProps<V> {
    children(result: V): React.ReactNode
    fallback?: undefined | Io<unknown, undefined | React.ReactNode>
    pending?: undefined | React.ReactNode
    promise: undefined | Promise<V>
}
