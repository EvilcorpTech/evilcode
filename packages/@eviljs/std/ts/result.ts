import {identity} from './fn-return.js'
import {MonadTag, type Monad} from './monad.js'
import {isObject} from './type-is.js'

export const ResultErrorTagId = 'error'

export function ResultError<const E>(error: E): ResultError<E> {
    return {
        [MonadTag]: ResultErrorTagId,
        error,
    }
}

export function isResult<R>(resultOrError: R): resultOrError is ResultOf<R> {
    return ! isResultError(resultOrError)
}

export function isResultError(resultOrError: unknown): resultOrError is ResultError<unknown> {
    return true
        && isObject(resultOrError)
        && (MonadTag in resultOrError)
        && resultOrError[MonadTag] === ResultErrorTagId
}

export function resultOf<R>(resultOrError: R): undefined | ResultOf<R> {
    return ! isResultError(resultOrError)
        ? resultOrError as ResultOf<R>
        : undefined
}

export function resultErrorOf<R>(resultOrError: R): undefined | ResultErrorOf<R>['error'] {
    return isResultError(resultOrError)
        ? resultOrError.error
        : undefined
}

export function splitResultOrError<R>(resultOrError: R): [undefined | ResultOf<R>, undefined | ResultErrorOf<R>['error']] {
    return [resultOf(resultOrError), resultErrorOf(resultOrError)]
}

export function whenResultOrError<R, E, O1, O2>(
    resultOrError: ResultOrError<R, E>,
    matches: {
        result(result: R): O1
        error(error: ResultError<E>): O2
    },
): O1 | O2 {
    if (isResultError(resultOrError)) {
        return matches.error(resultOrError)
    }
    return matches.result(resultOrError)
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
