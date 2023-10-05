import type {Fn, FnArgs} from '@eviljs/std/fn.js'
import {createRef} from '@eviljs/std/ref.js'
import {useMemo} from 'react'

/**
* @throws Promise | Error
*/
export function useAsync<A extends FnArgs, R>(asyncTask: Fn<A, Promise<R>>, ...args: A): R {
    type AsyncState<R> =
        | {
            stage: 'pending'
            result: undefined
            error: undefined
            promise: Promise<R>
        }
        | {
            stage: 'fulfilled'
            result: R
            error: undefined
            promise: Promise<R>
        }
        | {
            stage: 'rejected'
            result: undefined
            error: unknown
            promise: Promise<R>
        }

    const stateRef = useMemo(() => {
        const stateRef = createRef<AsyncState<R>>({
            stage: 'pending',
            result: undefined,
            error: undefined,
            promise: asyncTask(...args).then(
                result => {
                    stateRef.value = {
                        stage: 'fulfilled',
                        result,
                        error: undefined,
                        promise: stateRef.value.promise,
                    }
                    return result
                },
                error => {
                    stateRef.value = {
                        stage: 'rejected',
                        result: undefined,
                        error,
                        promise: stateRef.value.promise,
                    }
                    throw error
                },
            ),
        })

        return stateRef
    }, [asyncTask, ...args])

    switch (stateRef.value.stage) {
        case 'pending': throw stateRef.value.promise
        case 'fulfilled': return stateRef.value.result as R
        case 'rejected': throw stateRef.value.error
    }
}
