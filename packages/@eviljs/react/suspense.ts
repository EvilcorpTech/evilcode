import type {Task} from '@eviljs/std/fn.js'
import {createRef, type Ref} from '@eviljs/std/ref.js'

export const SuspenseMap = new WeakMap<SuspenseMapKey, SuspenseMapValue>()
type SuspenseMapKey = Function
type SuspenseMapValue = Ref<SuspenseState<unknown>>

/**
* @throws Promise | Error
*/
export function useSuspense<R>(asyncTask: Task<Promise<R>>): R {
    const suspenseRef = SuspenseMap.get(asyncTask) as Ref<SuspenseState<R>> ?? (() => {
        const suspenseRef = createSuspenseRef(asyncTask)

        SuspenseMap.set(asyncTask, suspenseRef)

        return suspenseRef
    })()

    const suspense = suspenseRef.value

    switch (suspense.stage) {
        case 'pending': throw suspense.promise
        case 'fulfilled': return suspense.result
        case 'rejected': throw suspense.error
    }

    // @ts-ignore
    throw (
        '@eviljs/react/suspense.useSuspense():\n'
        + 'suspense is in an unexpected state.'
    )
}

export function createSuspenseRef<R>(asyncTask: Task<Promise<R>>): Ref<SuspenseState<R>> {
    const promise = asyncTask().then(
        result => {
            suspense.value = {
                stage: 'fulfilled',
                result,
                error: undefined,
                promise,
            }
        },
        error => {
            suspense.value = {
                stage: 'rejected',
                result: undefined,
                error,
                promise,
            }
        },
    )

    const suspense = createRef<SuspenseState<R>>({
        stage: 'pending',
        result: undefined,
        error: undefined,
        promise,
    })

    return suspense
}

// Types ///////////////////////////////////////////////////////////////////////

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
