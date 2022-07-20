import {Error, isError} from './error.js'
import {tryCatch} from './try.js'
import {isNil, Nil} from './type.js'

// Optional ////////////////////////////////////////////////////////////////////

export function mappingSome<V1, V2>(
    onSome: Io<NonNullable<V1>, V2>
): Io<V1, Extract<V1, Nil> | V2>
{
    return (input: V1) => mapSomeWith(input, onSome)
}

export function mappingNone<V1, V2>(
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

export function mappingEither<V1, V2, V3>(
    onResult: Io<Exclude<V1, Error<unknown>>, V2>,
    onError: Io<Extract<V1, Error<unknown>>, V3>
): Io<V1, V2 | V3>
{
    return (input: V1) => mapEitherWith(input, onResult, onError)
}

export function mappingResult<V1, V2>(
    onResult: Io<Exclude<V1, Error<unknown>>, V2>
): Io<V1, Extract<V1, Error<unknown>> | V2>
{
    return (input: V1) => mapResultWith(input, onResult)
}

export function mappingError<V1, V2>(
    onError: Io<Extract<V1, Error<unknown>>, V2>
): Io<V1, Exclude<V1, Error<unknown>> | V2>
{
    return (input: V1) => mapErrorWith(input, onError)
}

export function mapEitherWith<V1, V2, V3>(
    input: V1,
    onResult: Io<Exclude<V1, Error<unknown>>, V2>,
    onError: Io<Extract<V1, Error<unknown>>, V3>,
): V2 | V3
{
    return ! isError(input)
        ? mapResultWith(input as Exclude<V1, Error<unknown>>, onResult) as V2
        : mapErrorWith(input as Extract<V1, Error<unknown>>, onError) as V3
}

export function mapResultWith<V1, V2>(
    input: V1,
    onResult: Io<Exclude<V1, Error<unknown>>, V2>,
): Extract<V1, Error<unknown>> | V2
{
    return ! isError(input)
        ? onResult(input as Exclude<V1, Error<unknown>>)
        : input as Extract<V1, Error<unknown>>
}

export function mapErrorWith<V1, V2>(
    input: V1,
    onError: Io<Extract<V1, Error<unknown>>, V2>,
): Exclude<V1, Error<unknown>> | V2
{
    return isError(input)
        ? onError(input as Extract<V1, Error<unknown>>)
        : input as Exclude<V1, Error<unknown>>
}

// Exception ///////////////////////////////////////////////////////////////////

export function mappingTrying<V1, V2, V3>(
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
export function mappingPromise<V1, V2, V3>(
    onThen: Io<V1, V2>,
    onCatch: Io<unknown, V3>,
): Io<Promise<V1>, Promise<V2 | V3>>
{
    return (input: Promise<V1>) => input.then(onThen).catch(onCatch)
}

/*
* Utility API, mapping only the fulfillment.
*/
export function mappingThen<V1, V2>(
    onThen: Io<V1, V2>,
): Io<Promise<V1>, Promise<V2>>
{
    return (input: Promise<V1>) => input.then(onThen)
}

/*
* Utility API, mapping only the rejection.
*/
export function mappingCatch<V1, V2>(
    onCatch: Io<unknown, V2>,
): Io<Promise<V1>, Promise<V1 | V2>>
{
    return (input: Promise<V1>) => input.catch(onCatch)
}

export function mappingCatchError<V1>(error?: Nil | never): Io<Promise<V1>, Promise<V1 | Error<unknown>>>
export function mappingCatchError<V1, V2>(error: V2): Io<Promise<V1>, Promise<V1 | Error<V2>>>
export function mappingCatchError<V1, V2>(
    error?: V2,
): Io<Promise<V1>, Promise<V1 | Error<V2>>>
{
    return (input: Promise<V1>) => input.catch(it => Error(error ?? it))
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Io<I, O> {
    (input: I): O
}
