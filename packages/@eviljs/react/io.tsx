import type {Fn} from '@eviljs/std/fn.js'
import type {ResourceLifecycleView} from '@eviljs/std/resource.js'
import {ResourceLifecycle, asResourceView, withResourceCanceled, withResourceFailed, withResourceLoaded, withResourceLoading, withResourceRequired} from '@eviljs/std/resource.js'
import type {Either} from '@eviljs/std/result.js'
import {Error} from '@eviljs/std/result.js'
import {isDefined} from '@eviljs/std/type.js'
import {useCallback, useRef, useState} from 'react'

export function useAsyncIo<A extends Array<unknown>, R>(asyncTask: Fn<A, Promise<R>>): AsyncIoManager<A, R> {
    const [state, setState] = useState<AsyncIoState<R>>({
        lifecycle: ResourceLifecycle.Initial,
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
            // {pending: true, fulfilled: false, rejected: false}
            lifecycle: withResourceRequired(withResourceLoading(state.lifecycle)),
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
                // {pending: false, fulfilled: true}
                lifecycle: withResourceLoaded(state.lifecycle),
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
                // {pending: false, rejected: true}
                lifecycle: withResourceFailed(state.lifecycle),
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
            // {pending: false}
            lifecycle: withResourceCanceled(state.lifecycle),
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
            // {pending: false, fulfilled: false, rejected: false}
            lifecycle: ResourceLifecycle.Initial,
            output: undefined,
            error: undefined,
        }))
    }, [])

    const lifecycleView = asResourceView(state.lifecycle)

    return {
        ...state,
        lifecycleView,
        pending: lifecycleView.loading,
        fulfilled: lifecycleView.loaded,
        rejected: lifecycleView.failed,
        call,
        cancel,
        reset,
        resetError,
        resetResponse,
    }
}

export function useAsyncIoStates(asyncIosStates: Record<string, AsyncIoStateView<unknown>>) {
    const pending = Object.values(asyncIosStates).some(it => it.pending)
    const rejected = Object.values(asyncIosStates).some(it => it.rejected)
    const errors = Object.values(asyncIosStates).map(it => it.error).filter(isDefined)
    const error = errors[0]
    const hasError = isDefined(error)

    return {error, errors, hasError, pending, rejected}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AsyncIoState<R> {
    lifecycle: ResourceLifecycle
    output: undefined | R
    error: undefined | unknown
}

export interface AsyncIoStateView<R> extends AsyncIoState<R> {
    lifecycleView: ResourceLifecycleView
    pending: boolean
    fulfilled: boolean
    rejected: boolean
}

export interface AsyncIoManager<A extends Array<unknown>, R> extends AsyncIoStateView<R> {
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
