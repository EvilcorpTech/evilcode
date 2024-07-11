import {identity} from './fn-return.js'
import {MonadTag, type Monad} from './monad.js'
import {isObject} from './type-is.js'

export const ResultErrorTagId = 'error'

export function ResultError<E>(error: E): ResultError<E> {
    return {
        [MonadTag]: ResultErrorTagId,
        error,
    }
}

export function isResultError(result: unknown): result is ResultError<unknown> {
    return true
        && isObject(result)
        && (MonadTag in result)
        && result[MonadTag] === ResultErrorTagId
}

export function resultOf<R>(result: R): undefined | ResultOf<R> {
    return ! isResultError(result)
        ? result as ResultOf<R>
        : undefined
}

export function resultErrorOf<R>(result: R): undefined | ResultErrorOf<R>['error'] {
    return isResultError(result)
        ? result.error
        : undefined
}

export function splitResultOrError<R>(result: R): [undefined | ResultOf<R>, undefined | ResultErrorOf<R>['error']] {
    return [resultOf(result), resultErrorOf(result)]
}

export function asResultOrError<V>(promise: Promise<V>): Promise<ResultOrError<V, unknown>> {
    return promise.then(identity, ResultError)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ResultError<E> extends Monad<typeof ResultErrorTagId> {
    error: E
}

export type ResultOrError<V, E> = V | ResultError<E>
export type ResultOf<V> = Exclude<V, ResultError<unknown>>
export type ResultErrorOf<V> = Extract<V, ResultError<unknown>>
