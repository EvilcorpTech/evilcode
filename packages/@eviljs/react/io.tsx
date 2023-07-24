import type {Fn} from '@eviljs/std/fn.js'
import {pipe} from '@eviljs/std/pipe.js'
import type {ResourceMaskView, ResourcePromiseView} from '@eviljs/std/resource.js'
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
} from '@eviljs/std/resource.js'
import type {Either} from '@eviljs/std/result.js'
import {Error} from '@eviljs/std/result.js'
import {isDefined} from '@eviljs/std/type.js'
import {useCallback, useRef, useState} from 'react'

export function useAsyncIo<A extends Array<unknown>, R>(asyncTask: Fn<A, Promise<R>>): AsyncIoManager<A, R> {
    const [state, setState] = useState<AsyncIoState<R>>({
        resource: ResourceMask.Initial,
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
            resource: pipe(state.resource)
                .to(withResourceRequired)
                .to(withResourceLoading)
            .end(),
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
                resource: pipe(state.resource)
                    .to(withResourceLoaded)
                    .to(withoutResourceLoading)
                    .to(withoutResourceFailed)
                .end(),
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
                resource: pipe(state.resource)
                    .to(withResourceFailed)
                    .to(withoutResourceLoading)
                    .to(withoutResourceLoaded)
                .end(),
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
            resource: pipe(state.resource)
                .to(withoutResourceLoading)
            .end(),
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
            resource: pipe(state.resource)
                .to(withoutResourceLoaded)
            .end(),
            output: undefined,
        }))
    }, [])

    const resetError = useCallback(() => {
        setState((state): AsyncIoState<R> => ({
            ...state,
            resource: pipe(state.resource)
                .to(withoutResourceFailed)
            .end(),
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

export function useAsyncIoAggregated(asyncIoViews: Record<string, AsyncIoView<unknown>>) {
    const pending = Object.values(asyncIoViews).some(it => it.pending)
    const rejected = Object.values(asyncIoViews).some(it => it.rejected)
    const outputs = Object.values(asyncIoViews).map(it => it.output)
    const errors = Object.values(asyncIoViews).map(it => it.error).filter(isDefined)
    const hasError = errors.length > 0

    return {errors, hasError, outputs, pending, rejected}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AsyncIoState<R> extends AsyncIoResultState<R> {
    resource: ResourceMask
}

export interface AsyncIoResultState<R> {
    error: undefined | unknown
    output: undefined | R
}

export interface AsyncIoView<R> extends AsyncIoState<R>, ResourceMaskView, ResourcePromiseView {
}

export interface AsyncIoManager<A extends Array<unknown>, R> extends AsyncIoView<R> {
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
