import {piping} from '@eviljs/std/fn-pipe'
import type {Fn, FnArgs} from '@eviljs/std/fn-type'
import {Future} from '@eviljs/std/promise-future'
import type {ResourceMaskView, ResourcePromiseView} from '@eviljs/std/resource'
import {
    ResourceMask,
    asPromiseView,
    asResourceView,
    withResourceFailed,
    withResourceLoaded,
    withResourceLoading,
    withResourceRequired,
    withoutResourceFailed,
    withoutResourceLoaded,
    withoutResourceLoading,
} from '@eviljs/std/resource'
import type {ResultOrError} from '@eviljs/std/result'
import {ResultError} from '@eviljs/std/result'
import {isDefined} from '@eviljs/std/type-is'
import {useCallback, useRef, useState} from 'react'

export function useAsyncIo<A extends FnArgs, R>(asyncTask: Fn<A, Promise<R>>): AsyncIoManager<A, R> {
    const [state, setState] = useState<AsyncIoState<R>>({
        resource: ResourceMask.Initial,
        output: undefined,
        error: undefined,
    })
    const taskRef = useRef<undefined | Future<R>>(undefined)

    const call = useCallback(async (...args: A) => {
        // We automatically cancel previous task.
        taskRef.current?.cancel()

        // We must retain current output and error states.
        // Whether the developer wants to clear them, he uses the reset() API
        // before issuing a call() request.
        setState((state): AsyncIoState<R> => ({
            ...state,
            resource: piping(state.resource)
                (withResourceRequired)
                (withResourceLoading)
            (),
        }))

        const taskPromise = Future.from(asyncTask(...args))

        taskRef.current = taskPromise

        try {
            const output = await taskPromise

            if (taskPromise.canceled) {
                return
            }

            setState((state): AsyncIoState<R> => ({
                ...state,
                resource: piping(state.resource)
                    (withResourceLoaded)
                    (withoutResourceLoading)
                    (withoutResourceFailed)
                (),
                output,
                error: undefined,
            }))

            return output
        }
        catch (error) {
            if (taskPromise.canceled) {
                return
            }

            setState((state): AsyncIoState<R> => ({
                ...state,
                resource: piping(state.resource)
                    (withResourceFailed)
                    (withoutResourceLoading)
                    (withoutResourceLoaded)
                (),
                output: undefined,
                error,
            }))

            return ResultError(error)
        }
    }, [asyncTask])

    const cancel = useCallback(() => {
        taskRef.current?.cancel()

        setState((state): AsyncIoState<R> => ({
            ...state,
            resource: piping(state.resource)
                (withoutResourceLoading)
            (),
        }))
    }, [])

    const reset = useCallback(() => {
        setState((state): AsyncIoState<R> => ({
            // ...state,
            resource: ResourceMask.Initial,
            output: undefined,
            error: undefined,
        }))
    }, [])

    const resetResponse = useCallback(() => {
        setState((state): AsyncIoState<R> => ({
            ...state,
            resource: piping(state.resource)
                (withoutResourceLoaded)
            (),
            output: undefined,
        }))
    }, [])

    const resetError = useCallback(() => {
        setState((state): AsyncIoState<R> => ({
            ...state,
            resource: piping(state.resource)
                (withoutResourceFailed)
            (),
            error: undefined,
        }))
    }, [])

    return {
        ...state,
        ...asResourceView(state.resource),
        ...asPromiseView(state.resource),
        call,
        cancel,
        reset,
        resetError,
        resetResponse,
    }
}

export function useAsyncIoAggregated(asyncIoViews: Record<string, AsyncIoView<unknown>>): {
    errors: Array<unknown>
    outputs: Array<unknown>
    pending: boolean
    rejected: boolean
    hasError: boolean
} {
    const pending = Object.values(asyncIoViews).some(it => it.pending)
    const rejected = Object.values(asyncIoViews).some(it => it.rejected)
    const outputs = Object.values(asyncIoViews).map(it => it.output)
    const errors = Object.values(asyncIoViews).map(it => it.error).filter(isDefined)
    const hasError = errors.length > 0

    return {errors, outputs, pending, rejected, hasError}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AsyncIoState<R> extends AsyncIoResultState<R> {
    resource: number
}

export interface AsyncIoResultState<R> {
    error: undefined | unknown
    output: undefined | R
}

export interface AsyncIoView<R> extends AsyncIoState<R>, ResourceMaskView, ResourcePromiseView {
}

export interface AsyncIoManager<A extends FnArgs, R> extends AsyncIoView<R> {
    call(...args: A): Promise<undefined | ResultOrError<R, unknown>>
    cancel(): void
    reset(): void
    resetError(): void
    resetResponse(): void
}
