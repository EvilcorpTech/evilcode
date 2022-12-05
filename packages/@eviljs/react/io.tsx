import type {Fn} from '@eviljs/std/fn.js'
import type {Either} from '@eviljs/std/result.js'
import {Error} from '@eviljs/std/result.js'
import {isDefined} from '@eviljs/std/type.js'
import {useCallback, useRef, useState} from 'react'

export function useAsyncIo<A extends Array<unknown>, R>(asyncTask: Fn<A, Promise<R>>): AsyncIoManager<A, R> {
    const [state, setState] = useState<AsyncIoState<R>>({
        pending: false,
        fulfilled: false,
        rejected: false,
        output: undefined,
        error: undefined,
    })
    const taskRef = useRef<null | PromiseCancellable<R>>(null)

    const call = useCallback(async (...args: A) => {
        if (taskRef.current) {
            // We automatically cancel previous task.
            taskRef.current.cancelled = true
        }

        // We must retain current output and error states.
        // Whether the developer wants to clear them, he uses the reset() API
        // before issuing a call() request.
        setState((state): AsyncIoState<R> => ({
            ...state,
            pending: true,
            fulfilled: false,
            rejected: false,
        }))

        taskRef.current = {
            promise: asyncTask(...args),
            cancelled: false,
        }

        const task = taskRef.current

        try {
            const output = await task.promise

            if (task.cancelled) {
                return
            }

            setState((state): AsyncIoState<R> => ({
                ...state,
                pending: false,
                fulfilled: true,
                output,
                error: undefined,
            }))

            return output
        }
        catch (error) {
            if (task.cancelled) {
                return
            }

            setState((state): AsyncIoState<R> => ({
                ...state,
                pending: false,
                rejected: true,
                output: undefined,
                error,
            }))

            return Error(error)
        }
    }, [asyncTask])

    const cancel = useCallback(() => {
        if (taskRef.current) {
            taskRef.current.cancelled = true
        }

        setState((state): AsyncIoState<R> => ({
            ...state,
            pending: false,
        }))
    }, [])

    const resetResponse = useCallback(() => {
        setState((state): AsyncIoState<R> => ({
            ...state,
            output: undefined,
        }))
    }, [])

    const resetError = useCallback(() => {
        setState((state): AsyncIoState<R> => ({
            ...state,
            error: undefined,
        }))
    }, [])

    const reset = useCallback(() => {
        setState((state): AsyncIoState<R> => ({
            // ...state,
            pending: false,
            fulfilled: false,
            rejected: false,
            output: undefined,
            error: undefined,
        }))
    }, [])

    return {...state, call, cancel, reset, resetError, resetResponse}
}

export function useAsyncIoStates(asyncIosStates: Record<string, Pick<AsyncIoState<unknown>, 'pending' | 'error'>>) {
    const pending = Object.values(asyncIosStates).some(it => it.pending)
    const errors = Object.values(asyncIosStates).map(it => it.error).filter(isDefined)
    const error = errors[0]
    const hasError = isDefined(error)

    return {error, errors, hasError, pending}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AsyncIoState<R> {
    pending: boolean
    fulfilled: boolean
    rejected: boolean
    output: undefined | R
    error: undefined | unknown
}

export interface AsyncIoManager<A extends Array<unknown>, R> extends AsyncIoState<R> {
    call: (...args: A) => Promise<undefined | Either<R>>
    cancel: () => void
    reset: () => void
    resetError: () => void
    resetResponse: () => void
}

export interface PromiseCancellable<T> {
    promise: Promise<T>
    cancelled: boolean
}
