import {MonadTag} from './monad.js'
import {isObject} from './type.js'

export const ErrorTagId = 'error'

export function Error<E>(error: E): Error<E> {
    return {[MonadTag]: ErrorTagId, error} satisfies Error<E>
}

export function isError(result: unknown): result is Error<unknown> {
    return isObject(result)
        ? ((MonadTag in result) && result[MonadTag] === ErrorTagId)
        : false
}

export function filterResult<R>(result: R): undefined | ResultOf<R> {
    return ! isError(result)
        ? result as ResultOf<R>
        : undefined
}

export function filterError<R>(result: R): undefined | ErrorOf<R>['error'] {
    return isError(result)
        ? result.error
        : undefined
}

export function splitEither<R>(result: R): [undefined | ResultOf<R>, undefined | ErrorOf<R>['error']] {
    return [filterResult(result), filterError(result)]
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Error<E> {
    [MonadTag]: typeof ErrorTagId
    error: E
}

export type Either<V, E extends Error<unknown> = Error<unknown>> = V | E
export type ResultOf<V> = Exclude<V, Error<unknown>>
export type ErrorOf<V> = Extract<V, Error<unknown>>
