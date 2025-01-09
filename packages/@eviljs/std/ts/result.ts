import {identity} from './fn-return.js'
import {MonadTag, type Monad} from './monad.js'
import {throwInvalidType} from './throw.js'
import {InvalidTypeMessage} from './type-ensure.js'
import {isObject} from './type-is.js'

export const ResultErrorTagId = 'error'

export function ResultError<const E>(error: E): ResultError<E> {
    return {
        [MonadTag]: ResultErrorTagId,
        error,
    }
}

export function asResultOrError<V>(promise: Promise<V>): Promise<ResultOrError<V, unknown>> {
    return promise.then(identity, ResultError)
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
        error(error: E): O2
    },
): O1 | O2 {
    if (isResultError(resultOrError)) {
        return matches.error(resultOrError.error)
    }
    return matches.result(resultOrError)
}

/**
* @throws InvalidInput
*/
export function ensureResult<V, E>(value: ResultOrError<V, E>, ctx?: any): V {
    if (! isResult(value)) {
        return throwInvalidType(InvalidTypeMessage('a Result', value, ctx))
    }
    return value
}

/**
* @throws InvalidInput
*/
export function assertResult<V, E>(value: ResultOrError<V, E>, ctx?: any): asserts value is V {
    ensureResult(value, ctx)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ResultError<E> extends Monad<typeof ResultErrorTagId> {
    error: E
}

export type ResultOrError<V, E> = V | ResultError<E>
export type ResultOf<V> = Exclude<V, ResultError<unknown>>
export type ResultErrorOf<V> = Extract<V, ResultError<unknown>>
