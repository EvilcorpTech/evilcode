import type {Fn} from '@eviljs/std/fn.js'
import type {ResourceLifecycleView} from '@eviljs/std/resource.js'
import {ResourceLifecycle, asResourceView, withResourceCanceled, withResourceFailed, withResourceLoaded, withResourceLoading, withResourceRequired} from '@eviljs/std/resource.js'
import type {Either} from '@eviljs/std/result.js'
import {Error} from '@eviljs/std/result.js'
import {isDefined} from '@eviljs/std/type.js'
import {useCallback, useRef, useState} from 'react'

export function useAsyncIo<A extends Array<unknown>, R>(asyncTask: Fn<A, Promise<R>>): AsyncIoManager<A, R> {
    const [state, setState] = useState<AsyncIoState<R>>({
        resource: ResourceLifecycle.Initial,
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
            resource: withResourceRequired(withResourceLoading(state.resource)),
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
                resource: withResourceLoaded(state.resource),
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
                resource: withResourceFailed(state.resource),
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
            resource: withResourceCanceled(state.resource),
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
            resource: ResourceLifecycle.Initial,
            output: undefined,
            error: undefined,
        }))
    }, [])

    const resourceView = asResourceView(state.resource)

    return {
        ...state,
        ...resourceView,
        pending: resourceView.loading,
        fulfilled: resourceView.loaded,
        rejected: resourceView.failed,
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
    resource: ResourceLifecycle
    output: undefined | R
    error: undefined | unknown
}

export interface AsyncIoStateView<R> extends AsyncIoState<R>, ResourceLifecycleView {
    pending: boolean
    fulfilled: boolean
    rejected: boolean
}

export interface AsyncIoManager<A extends Array<unknown>, R> extends AsyncIoStateView<R> {
    call(...args: A): Promise<undefined | Either<R>>
    cancel(): void
    reset(): void
    resetError(): void
    resetResponse(): void
}

export interface PromiseCancellable<T> {
    promise: Promise<T>
    cancelled: boolean
}
