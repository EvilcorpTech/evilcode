import {identity} from './fn-return.js'
import {tryCatch} from './fn-try.js'
import type {Io} from './fn-type.js'
import {Error, isError, type ErrorOf, type ResultOf} from './result.js'
import {asArray, isNone, type None} from './type.js'

export * from './result.js'

// Debug ///////////////////////////////////////////////////////////////////////

export function logging<V>(
    formatOptional?: undefined | Io<V, unknown>,
    typeOptional?: undefined | 'debug' | 'log' | 'warn' | 'error',
): Io<V, V> {
    const type = typeOptional ?? 'log'
    const format = formatOptional ?? identity

    return (input: V) => (
        inspectWithConsole(type, asArray(format(input))),
        input
    )
}

export function inspectWithConsole(type: 'debug' | 'log' | 'warn' | 'error', args: Array<unknown>): void {
    switch (type) {
        case 'error': return console.error(...args)
        case 'warn': return console.warn(...args)
        case 'log': return console.log(...args)
        case 'debug': return console.debug(...args)
        default: return console.log(...args)
    }
}

// Chaining ////////////////////////////////////////////////////////////////////

export function chaining<V>(chain: Io<V, any>): Io<V, V> {
    return (input: V) => (chain(input), input)
}

// Optional ////////////////////////////////////////////////////////////////////

export function mappingOptional<V1, V2, V3>(onSome: Io<NonNullable<V1>, V2>, onNone: Io<None, V3>): Io<None | V1, V2 | V3> {
    return (input: None | V1) => mapOptional(input, onSome, onNone)
}

export function mapOptional<V1, V2, V3>(input: None | V1, onSome: Io<NonNullable<V1>, V2>, onNone: Io<None, V3>): V2 | V3 {
    return ! isNone(input)
        ? onSome(input as NonNullable<V1>)
        : onNone(input)
}

export function mappingSome<V1, V2>(onSome: Io<NonNullable<V1>, V2>): Io<None | V1, Extract<V1, None> | V2> {
    return (input: None | V1) => mapSome(input, onSome)
}

export function mappingNone<V1, V2>(onNone: Io<None, V2>): Io<V1, Exclude<V1, None> | V2> {
    return (input: V1) => mapNone(input, onNone)
}

export function mapSome<V1, V2>(input: None | V1, onSome: Io<NonNullable<V1>, V2>): Extract<V1, None> | V2 {
    return ! isNone(input)
        ? onSome(input as NonNullable<V1>)
        : input as Extract<V1, None>
}

export function mapNone<V1, V2>(input: V1, onNone: Io<None, V2>): Exclude<V1, None> | V2 {
    return isNone(input)
        ? onNone(input as None)
        : input as Exclude<V1, None>
}

// Boolean Expression //////////////////////////////////////////////////////////

export function mappingTrue(onTrue: Io<boolean, boolean>): Io<boolean, boolean> {
    return input => mapTrue(input, onTrue)
}

export function mappingFalse(onFalse: Io<boolean, boolean>): Io<boolean, boolean> {
    return input => mapFalse(input, onFalse)
}

export function mapTrue(input: boolean, onTrue: Io<boolean, boolean>): boolean {
    return input
        ? onTrue(input)
        : input
}

export function mapFalse(input: boolean, onFalse: Io<boolean, boolean>): boolean {
    return ! input
        ? onFalse(input)
        : input
}

// Either: Result | Error //////////////////////////////////////////////////////

export function mappingEither<V1, V2, V3>(onResult: Io<ResultOf<V1>, V2>, onError: Io<ErrorOf<V1>, V3>): Io<V1, V2 | V3> {
    return (input: V1) => mapEither(input, onResult, onError)
}

export function mappingResult<V1, V2>(onResult: Io<ResultOf<V1>, V2>): Io<V1, ErrorOf<V1> | V2> {
    return (input: V1) => mapResult(input, onResult)
}

export function mappingError<V1, V2>(onError: Io<ErrorOf<V1>, V2>): Io<V1, ResultOf<V1> | V2> {
    return (input: V1) => mapError(input, onError)
}

export function mappingErrorValue<V1, V2>(onError: Io<ErrorOf<V1>['error'], V2>): Io<V1, ResultOf<V1> | V2> {
    return (input: V1) => mapErrorValue(input, onError)
}

export function mapEither<V1, V2, V3>(input: V1, onResult: Io<ResultOf<V1>, V2>, onError: Io<ErrorOf<V1>, V3>): V2 | V3 {
    return ! isError(input)
        ? mapResult(input as ResultOf<V1>, onResult) as V2
        : mapError(input as ErrorOf<V1>, onError) as V3
}

export function mapResult<V1, V2>(input: V1, onResult: Io<ResultOf<V1>, V2>): ErrorOf<V1> | V2 {
    return ! isError(input)
        ? onResult(input as ResultOf<V1>)
        : input as ErrorOf<V1>
}

export function mapError<V1, V2>(input: V1, onError: Io<ErrorOf<V1>, V2>): ResultOf<V1> | V2 {
    return isError(input)
        ? onError(input as ErrorOf<V1>)
        : input as ResultOf<V1>
}

export function mapErrorValue<V1, V2>(input: V1, onError: Io<ErrorOf<V1>['error'], V2>): ResultOf<V1> | V2 {
    return isError(input)
        ? onError(input.error as ErrorOf<V1>['error'])
        : input as ResultOf<V1>
}

// Exception ///////////////////////////////////////////////////////////////////

export function trying<V1, V2, V3>(onTry: Io<V1, V2>, onCatch: Io<unknown, V3>): Io<V1, V2 | V3> {
    return (input: V1) => tryCatch(() => onTry(input), onCatch)
}

// Promise /////////////////////////////////////////////////////////////////////

/*
* The safest API, requiring to handle the error.
*/
export function mappingPromise<V1, V2, V3>(onThen: Io<V1, V2 | PromiseLike<V2>>, onCatch: Io<unknown, V3 | PromiseLike<V3>>): Io<Promise<V1>, Promise<V2 | V3>> {
    return (input: Promise<V1>) => input.then(onThen).catch(onCatch)
}

/*
* Sugar API, for easy prototyping.
*/
export function then<V1, V2>(onThen: Io<V1, V2 | PromiseLike<V2>>, onCatch?: never): Io<Promise<V1>, Promise<V2>>
export function then<V1, V2, V3>(onThen: Io<V1, V2 | PromiseLike<V2>>, onCatch: Io<unknown, V3 | PromiseLike<V3>>): Io<Promise<V1>, Promise<V2 | V3>>
export function then<V1, V2, V3>(onThen: Io<V1, V2 | PromiseLike<V2>>, onCatch?: Io<unknown, V3 | PromiseLike<V3>>): Io<Promise<V1>, Promise<V2 | V3>> {
    return ! onCatch
        ? (input: Promise<V1>) => input.then(onThen)
        : (input: Promise<V1>) => input.then(onThen).catch(onCatch)
}

/*
* Utility API, mapping the fulfillment.
*/
export function awaiting<V1, V2>(onThen: Io<V1, V2 | PromiseLike<V2>>): Io<Promise<V1>, Promise<V2>> {
    return (input: Promise<V1>) => input.then(onThen)
}

/*
* Utility API, mapping the rejection.
*/
export function catching<V1, V2>(onCatch: Io<unknown, V2 | PromiseLike<V2>>): Io<Promise<V1>, Promise<V1 | V2>> {
    return (input: Promise<V1>) => input.catch(onCatch)
}

/*
* Shortcut API. Same of catching(Error).
*/
export function catchingError<V1>(error?: None | never): Io<Promise<V1>, Promise<V1 | Error<unknown>>>
export function catchingError<V1, V2>(error: V2): Io<Promise<V1>, Promise<V1 | Error<V2>>>
export function catchingError<V1, V2>(errorOptional?: V2): Io<Promise<V1>, Promise<V1 | Error<V2>>> {
    return (input: Promise<V1>) => input.catch(error => Error(errorOptional ?? error))
}
