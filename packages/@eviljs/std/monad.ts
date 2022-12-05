import type {ErrorOf, ResultOf} from './result.js'
import {Error, isError} from './result.js'
import {tryCatch} from './try.js'
import type {Nil} from './type.js'
import {isNil} from './type.js'

export const MonadTag = '#__kind__$' // We can't use a Symbol or Class, because it must be serializable.

// Optional ////////////////////////////////////////////////////////////////////

export function mapSome<V1, V2>(
    onSome: Io<NonNullable<V1>, V2>
): Io<V1, Extract<V1, Nil> | V2>
{
    return (input: V1) => mapSomeWith(input, onSome)
}

export function mapNone<V1, V2>(
    onNone: Io<Nil, V2>
): Io<V1, Exclude<V1, Nil> | V2>
{
    return (input: V1) => mapNoneWith(input, onNone)
}

export function mapSomeWith<V1, V2>(
    input: V1,
    onSome: Io<NonNullable<V1>, V2>
): Extract<V1, Nil> | V2
{
    return ! isNil(input)
        ? onSome(input as NonNullable<V1>)
        : input as Extract<V1, Nil>
}

export function mapNoneWith<V1, V2>(
    input: V1,
    onNone: Io<Nil, V2>
): Exclude<V1, Nil> | V2
{
    return isNil(input)
        ? onNone(input as Nil)
        : input as Exclude<V1, Nil>
}

// Either: Result | Error //////////////////////////////////////////////////////

export function mapEither<V1, V2, V3>(
    onResult: Io<ResultOf<V1>, V2>,
    onError: Io<ErrorOf<V1>, V3>
): Io<V1, V2 | V3>
{
    return (input: V1) => mapEitherWith(input, onResult, onError)
}

export function mapResult<V1, V2>(
    onResult: Io<ResultOf<V1>, V2>
): Io<V1, ErrorOf<V1> | V2>
{
    return (input: V1) => mapResultWith(input, onResult)
}

export function mapError<V1, V2>(
    onError: Io<ErrorOf<V1>, V2>
): Io<V1, ResultOf<V1> | V2>
{
    return (input: V1) => mapErrorWith(input, onError)
}

export function mapErrorValue<V1, V2>(
    onError: Io<ErrorOf<V1>['error'], V2>
): Io<V1, ResultOf<V1> | V2>
{
    return (input: V1) => mapErrorValueWith(input, onError)
}

export function mapEitherWith<V1, V2, V3>(
    input: V1,
    onResult: Io<ResultOf<V1>, V2>,
    onError: Io<ErrorOf<V1>, V3>,
): V2 | V3
{
    return ! isError(input)
        ? mapResultWith(input as ResultOf<V1>, onResult) as V2
        : mapErrorWith(input as ErrorOf<V1>, onError) as V3
}

export function mapResultWith<V1, V2>(
    input: V1,
    onResult: Io<ResultOf<V1>, V2>,
): ErrorOf<V1> | V2
{
    return ! isError(input)
        ? onResult(input as ResultOf<V1>)
        : input as ErrorOf<V1>
}

export function mapErrorWith<V1, V2>(
    input: V1,
    onError: Io<ErrorOf<V1>, V2>,
): ResultOf<V1> | V2
{
    return isError(input)
        ? onError(input as ErrorOf<V1>)
        : input as ResultOf<V1>
}

export function mapErrorValueWith<V1, V2>(
    input: V1,
    onError: Io<ErrorOf<V1>['error'], V2>,
): ResultOf<V1> | V2
{
    return isError(input)
        ? onError(input.error as ErrorOf<V1>['error'])
        : input as ResultOf<V1>
}

// Exception ///////////////////////////////////////////////////////////////////

export function mapTrying<V1, V2, V3>(
    onTry: Io<V1, V2>,
    onCatch: Io<unknown, V3>,
): Io<V1, V2 | V3>
{
    return (input: V1) => tryCatch(() => onTry(input), onCatch)
}

// Promise /////////////////////////////////////////////////////////////////////

/*
* Sugar API, for easy prototyping.
*/
export function then<V1, V2>(onThen: Io<V1, V2>, onCatch?: never): Io<Promise<V1>, Promise<V2>>
export function then<V1, V2, V3>(onThen: Io<V1, V2>, onCatch: Io<unknown, V3>): Io<Promise<V1>, Promise<V2 | V3>>
export function then<V1, V2, V3>(
    onThen: Io<V1, V2>,
    onCatch?: Io<unknown, V3>,
): Io<Promise<V1>, Promise<V2 | V3>>
{
    return ! onCatch
        ? (input: Promise<V1>) => input.then(onThen)
        : (input: Promise<V1>) => input.then(onThen).catch(onCatch)
}

/*
* The safest API, requiring to handle the error.
*/
export function mapPromise<V1, V2, V3>(
    onThen: Io<V1, V2>,
    onCatch: Io<unknown, V3>,
): Io<Promise<V1>, Promise<V2 | V3>>
{
    return (input: Promise<V1>) => input.then(onThen).catch(onCatch)
}

/*
* Utility API, mapping only the fulfillment.
*/
export function mapThen<V1, V2>(
    onThen: Io<V1, V2>,
): Io<Promise<V1>, Promise<V2>>
{
    return (input: Promise<V1>) => input.then(onThen)
}

/*
* Utility API, mapping only the rejection.
*/
export function mapCatch<V1, V2>(
    onCatch: Io<unknown, V2>,
): Io<Promise<V1>, Promise<V1 | V2>>
{
    return (input: Promise<V1>) => input.catch(onCatch)
}

/*
* Shortcut API. Same of mapCatch(Error).
*/
export function mapCatchError<V1>(error?: Nil | never): Io<Promise<V1>, Promise<V1 | Error<unknown>>>
export function mapCatchError<V1, V2>(error: V2): Io<Promise<V1>, Promise<V1 | Error<V2>>>
export function mapCatchError<V1, V2>(
    error?: V2,
): Io<Promise<V1>, Promise<V1 | Error<V2>>>
{
    return (input: Promise<V1>) => input.catch(it => Error(error ?? it))
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Io<I, O> {
    (input: I): O
}
