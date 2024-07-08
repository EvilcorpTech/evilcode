import {compute} from '@eviljs/std/fn-compute.js'
import type {TaskAsync} from '@eviljs/std/fn-type.js'
import {createRef, type Ref} from '@eviljs/std/ref.js'
import {Suspense} from 'react'
import type {AwaitedProps} from '../awaited.js'
import {HookProvider} from '../hook-provider.js'

export const SuspensePromiseMap: WeakMap<SuspensePromiseMapKey, SuspenseStateRef> = new WeakMap()
export const SuspenseTaskMap: WeakMap<SuspenseTaskMapKey, SuspenseStateRef> = new WeakMap()
type SuspensePromiseMapKey<V = any> = Promise<V>
type SuspenseTaskMapKey<V = any> = () => Promise<V>
type SuspenseStateRef<V = any> = Ref<SuspenseState<V>>

export function Suspended<V>(props: SuspendedProps<V>): React.ReactNode {
    const {children, promise, pending} = props

    if (! promise) {
        return compute(pending)
    }

    return (
        <Suspense fallback={compute(pending)}>
            <HookProvider use={() => useSuspense(promise)}>
                {children}
            </HookProvider>
        </Suspense>
    )
}

/**
* @throws Promise | Error
*/
export function useSuspense<R>(promise: Promise<R>): R {
    const weakMap: WeakMap<SuspensePromiseMapKey<R>, SuspenseStateRef<R>> = SuspensePromiseMap
    const suspenseRef = weakMap.get(promise) ?? (() => {
        const suspenseRef = createSuspenseRef(promise)

        weakMap.set(promise, suspenseRef)

        return suspenseRef
    })()

    return useSuspenseValue(suspenseRef)
}

/**
* @throws Promise | Error
*/
export function useSuspenseIo<R>(asyncTask: TaskAsync<R>): R {
    const weakMap: WeakMap<SuspenseTaskMapKey<R>, SuspenseStateRef<R>> = SuspenseTaskMap
    const suspenseRef = weakMap.get(asyncTask) ?? (() => {
        const suspenseRef = createSuspenseRef(asyncTask())

        weakMap.set(asyncTask, suspenseRef)

        return suspenseRef
    })()

    return useSuspenseValue(suspenseRef)
}

/**
* @throws Promise | Error
*/
export function useSuspenseValue<R>(suspenseRef: SuspenseStateRef<R>): R {
    const suspense = suspenseRef.value

    switch (suspense.stage) {
        case 'pending': throw suspense.promise
        case 'fulfilled': return suspense.result
        case 'rejected': throw suspense.error
    }

    // @ts-ignore
    throw (
        '@eviljs/react/suspense.useSuspenseValue():\n'
        + 'suspense is in an unexpected state.'
    )
}

export function createSuspenseRef<R>(promise: Promise<R>): Ref<SuspenseState<R>> {
    const suspense = createRef<SuspenseState<R>>({
        stage: 'pending',
        result: undefined,
        error: undefined,
        promise: promise.then(
            result => {
                suspense.value = {
                    stage: 'fulfilled',
                    result,
                    error: undefined,
                    promise: suspense.value.promise,
                }
            },
            error => {
                suspense.value = {
                    stage: 'rejected',
                    result: undefined,
                    error,
                    promise: suspense.value.promise,
                }
            },
        ),
    })

    return suspense
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SuspendedProps<V> extends AwaitedProps<V> {
}

type SuspenseState<R> =
    | {
        stage: 'pending'
        result: undefined
        error: undefined
        promise: Promise<void>
    }
    | {
        stage: 'fulfilled'
        result: R
        error: undefined
        promise: Promise<void>
    }
    | {
        stage: 'rejected'
        result: undefined
        error: unknown
        promise: Promise<void>
    }
