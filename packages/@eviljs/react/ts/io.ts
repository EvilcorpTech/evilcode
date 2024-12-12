import type {FnArgs, FnAsync} from '@eviljs/std/fn-type'
import {areObjectsEqualShallow} from '@eviljs/std/object'
import type {PromiseView} from '@eviljs/std/promise'
import type {ResultOrError} from '@eviljs/std/result'
import {asResultOrError, isResult, isResultError, whenResultOrError} from '@eviljs/std/result'
import {isDefined} from '@eviljs/std/type-is'
import {useCallback, useRef, useState} from 'react'

export function useAsyncIo<A extends FnArgs, R>(asyncTask: FnAsync<A, R>, deps?: Array<unknown>): AsyncIoManager<A, R> {
    const [state, setState] = useState<AsyncIoState<R>>({
        output: undefined,
        error: undefined,
        result: undefined,
        fulfilled: false,
        rejected: false,
        pending: false,
    })
    const taskHandleRef = useRef<TaskHandle>(undefined)

    interface TaskHandle {
        cancel(): void
        canceled: boolean
        readonly promise: Promise<ResultOrError<R, unknown>>
    }

    const call = useCallback(async (...args: A): Promise<undefined | ResultOrError<R, unknown>> => {
        // We must cancel previous task.
        taskHandleRef.current?.cancel()

        // We must retain current result and error states.
        // Whether the developer wants to clear them, he uses the reset() API
        // before issuing a call() request.
        setState(state => {
            const nextState: AsyncIoState<R> = {
                output: state.output,
                error: state.error,
                result: state.result,
                fulfilled: state.fulfilled,
                rejected: state.rejected,
                pending: true,
            }
            if (areObjectsEqualShallow(state, nextState)) {
                return state // Optimization.
            }
            return nextState
        })

        const taskHandle: TaskHandle = {
            cancel() { taskHandle.canceled = true },
            canceled: false,
            promise: asResultOrError(asyncTask(...args)),
        }

        taskHandleRef.current = taskHandle

        const resultOrError: ResultOrError<R, unknown> = await taskHandle.promise

        if (taskHandle.canceled && taskHandleRef.current !== taskHandle) {
            // A new task started after current one. We fulfill current one
            // with the result-or-error of the newer one.
            return taskHandleRef.current?.promise
        }
        if (taskHandle.canceled && taskHandleRef.current === taskHandle) {
            // Task has been canceled with cancel() and no new task started with call().
            return
        }

        setState(
            whenResultOrError(resultOrError, {
                result: (result): AsyncIoState<R> => ({
                    output: resultOrError,
                    error: undefined,
                    result: result,
                    fulfilled: true,
                    rejected: false,
                    pending: false,
                }),
                error: (error): AsyncIoState<R> => ({
                    output: resultOrError,
                    error: error,
                    result: undefined,
                    fulfilled: false,
                    rejected: true,
                    pending: false,
                }),
            })
        )

        return resultOrError
    }, deps ?? [])

    const cancel = useCallback(() => {
        taskHandleRef.current?.cancel()

        setState(state => {
            const nextState: AsyncIoState<R> = {
                output: state.output,
                error: state.error,
                result: state.result,
                fulfilled: state.fulfilled,
                rejected: state.rejected,
                pending: false,
            }
            if (areObjectsEqualShallow(state, nextState)) {
                return state // Optimization.
            }
            return nextState
        })
    }, [])

    const reset = useCallback(() => {
        setState(state => {
            const nextState: AsyncIoState<R> = {
                output: undefined,
                error: undefined,
                result: undefined,
                fulfilled: false,
                rejected: false,
                pending: false,
            }
            if (areObjectsEqualShallow(state, nextState)) {
                return state // Optimization.
            }
            return nextState
        })
    }, [])

    const resetError = useCallback(() => {
        setState(state => {
            const nextState: AsyncIoState<R> = {
                output: isResultError(state.output) ? undefined : state.output,
                error: undefined,
                result: state.result,
                fulfilled: state.fulfilled,
                rejected: false,
                pending: state.pending,
            }
            if (areObjectsEqualShallow(state, nextState)) {
                return state // Optimization.
            }
            return nextState
        })
    }, [])

    const resetResult = useCallback(() => {
        setState(state => {
            const nextState: AsyncIoState<R> = {
                output: isResult(state.output) ? undefined : state.output,
                error: state.error,
                result: undefined,
                fulfilled: false,
                rejected: state.rejected,
                pending: state.pending,
            }
            if (areObjectsEqualShallow(state, nextState)) {
                return state // Optimization.
            }
            return nextState
        })
    }, [])

    return {...state, call, cancel, reset, resetError, resetResult}
}

export function useAsyncIoAggregated(asyncIoStates: Record<string, AsyncIoState<unknown>>): {
    errors: Array<unknown>
    results: Array<unknown>
    pending: boolean
    rejected: boolean
    hasError: boolean
} {
    const errors = Object.values(asyncIoStates).map(it => it.error).filter(isDefined)
    const results = Object.values(asyncIoStates).map(it => it.result)
    const pending = Object.values(asyncIoStates).some(it => it.pending)
    const rejected = Object.values(asyncIoStates).some(it => it.rejected)
    const hasError = errors.length > 0

    return {errors, results, pending, rejected, hasError}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AsyncIoState<R> extends PromiseView {
    output: undefined | ResultOrError<R, unknown>
    error: undefined | unknown
    result: undefined | R
}

export interface AsyncIoManager<A extends FnArgs, R> extends AsyncIoState<R> {
    call(...args: A): Promise<undefined | ResultOrError<R, unknown>>
    cancel(): void
    reset(): void
    resetError(): void
    resetResult(): void
}
