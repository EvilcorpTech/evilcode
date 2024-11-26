import {compute, type Computable} from '@eviljs/std/fn-compute'
import {isDefined} from '@eviljs/std/type-is'
import {useMemo, useRef} from 'react'
import {useRender} from './render.js'

export function Await<V>(props: AwaitProps<V>): React.ReactNode {
    const {children, fallback, promise, recover} = props

    const promiseState = usePromise(promise)

    if (! promiseState) {
        return compute(fallback)
    }
    if (promiseState.stage === 'pending') {
        return compute(fallback)
    }
    if (promiseState.stage === 'rejected') {
        return isDefined(recover)
            ? compute(recover, promiseState.error)
            : compute(fallback)
    }
    return children(promiseState.result)
}

export function usePromise<V>(promise: Promise<V>): PromiseState<V>
export function usePromise<V>(promise: undefined | Promise<V>): undefined | PromiseState<V>
export function usePromise<V>(promise: undefined | Promise<V>): undefined | PromiseState<V> {
    const registryRef = useRef<PromiseMap<V>>(new WeakMap())
    const render = useRender()

    const pendingStateOptional = useMemo(() => {
        if (! promise) {
            return
        }

        promise.then(
            result => {
                registryRef.current.set(promise, {stage: 'fulfilled', result: result})
                render()
            },
            error => {
                registryRef.current.set(promise, {stage: 'rejected', error: error})
                render()
            },
        )
        return {stage: 'pending'} satisfies PromiseState<V>
    }, [promise])

    if (! promise) {
        return
    }

    return registryRef.current.get(promise) ?? pendingStateOptional
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AwaitProps<V> {
    children(result: V): React.ReactNode
    fallback?: undefined | Computable<React.ReactNode>
    promise: undefined | Promise<V>
    recover?: undefined | Computable<React.ReactNode, [error: unknown]>
}

type PromiseMap<V> = WeakMap<Promise<V>, PromiseState<V>>

type PromiseState<V> =
    | {stage: 'pending'}
    | {stage: 'fulfilled', result: V}
    | {stage: 'rejected', error: unknown}
