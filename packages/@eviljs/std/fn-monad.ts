import {identity} from './fn-return.js'
import {tryCatch} from './fn-try.js'
import type {Io} from './fn-type.js'
import {asResultError, isResultError, type ResultError, type ResultErrorOf, type ResultOf} from './result.js'
import {asArray, isNone, isSome, type None} from './type.js'

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

export function mappingOptional<I, II extends I, O1, O2>(onSome: Io<NonNullable<II>, O1>, onNone: Io<Extract<I, None>, O2>): Io<I, O1 | O2>
export function mappingOptional<I, O1, O2>(onSome: Io<NonNullable<I>, O1>, onNone: Io<Extract<I, None>, O2>): Io<I, O1 | O2> {
    return (input: I) => mapOptional(input, onSome, onNone)
}

export function mapOptional<I, O1, O2>(input: I, onSome: Io<NonNullable<I>, O1>, onNone: Io<Extract<I, None>, O2>): O1 | O2 {
    return ! isNone(input)
        ? onSome(input as NonNullable<I>)
        : onNone(input as Extract<I, None>)
}

export function mappingSome<I, II extends I, O>(onSome: Io<NonNullable<II>, O>): Io<I, O | Extract<I, None>>
export function mappingSome<I, O>(onSome: Io<NonNullable<I>, O>): Io<I, O | Extract<I, None>> {
    return (input: I) => mapSome(input, onSome)
}

export function mapSome<I, O>(input: I, onSome: Io<NonNullable<I>, O>): O | Extract<I, None> {
    return isSome(input)
        ? onSome(input as NonNullable<I>)
        : input as Extract<I, None>
}

export function mappingNone<I, II extends I, O>(onNone: Io<Extract<II, None>, O>): Io<I, O | Exclude<I, void | None>>
export function mappingNone<I, O>(onNone: Io<Extract<I, None>, O>): Io<I, O | Exclude<I, void | None>> {
    return (input: I) => mapNone(input, onNone)
}

export function mapNone<I, O>(input: I, onNone: Io<Extract<I, None>, O>): O | Exclude<I, void | None> {
    return isNone(input)
        ? onNone(input as Extract<I, None>)
        : input as Exclude<I, void | None>
}

// Boolean /////////////////////////////////////////////////////////////////////

export function mappingBoolean<I, O>(onTrue: Io<true, I>, onFalse: Io<false, O>): Io<boolean, I | O> {
    return input => mapBoolean(input, onTrue, onFalse)
}

export function mapBoolean<I, O>(input: boolean, onTrue: Io<true, I>, onFalse: Io<false, O>): I | O {
    return input
        ? onTrue(input)
        : onFalse(input)
}

// Either: Result | Error //////////////////////////////////////////////////////

export function mappingEither<I, II extends I, O1, O2>(onResult: Io<ResultOf<II>, O1>, onError: Io<ResultErrorOf<I>, O2>): Io<I, O1 | O2>
export function mappingEither<I, O1, O2>(onResult: Io<ResultOf<I>, O1>, onError: Io<ResultErrorOf<I>, O2>): Io<I, O1 | O2> {
    return (input: I) => mapEither(input, onResult, onError)
}

export function mapEither<I, O1, O2>(input: I, onResult: Io<ResultOf<I>, O1>, onError: Io<ResultErrorOf<I>, O2>): O1 | O2 {
    return ! isResultError(input)
        ? mapResult(input as ResultOf<I>, onResult) as O1
        : mapError(input as ResultErrorOf<I>, onError) as O2
}

export function mappingResult<I, II extends I, O>(onResult: Io<ResultOf<II>, O>): Io<I, ResultErrorOf<I> | O>
export function mappingResult<I, O>(onResult: Io<ResultOf<I>, O>): Io<I, ResultErrorOf<I> | O> {
    return (input: I) => mapResult(input, onResult)
}

export function mapResult<I, O>(input: I, onResult: Io<ResultOf<I>, O>): ResultErrorOf<I> | O {
    return ! isResultError(input)
        ? onResult(input as ResultOf<I>)
        : input as ResultErrorOf<I>
}

export function mappingError<I, II extends I, O>(onError: Io<ResultErrorOf<II>, O>): Io<I, ResultOf<I> | O>
export function mappingError<I, O>(onError: Io<ResultErrorOf<I>, O>): Io<I, ResultOf<I> | O> {
    return (input: I) => mapError(input, onError)
}

export function mapError<I, O>(input: I, onError: Io<ResultErrorOf<I>, O>): ResultOf<I> | O {
    return isResultError(input)
        ? onError(input as ResultErrorOf<I>)
        : input as ResultOf<I>
}

export function mappingErrorValue<I, II extends I, O>(onError: Io<ResultErrorOf<II>['error'], O>): Io<I, ResultOf<I> | O>
export function mappingErrorValue<I, O>(onError: Io<ResultErrorOf<I>['error'], O>): Io<I, ResultOf<I> | O> {
    return (input: I) => mapErrorValue(input, onError)
}

export function mapErrorValue<I, O>(input: I, onError: Io<ResultErrorOf<I>['error'], O>): ResultOf<I> | O {
    return isResultError(input)
        ? onError(input.error as ResultErrorOf<I>['error'])
        : input as ResultOf<I>
}

// Exception ///////////////////////////////////////////////////////////////////

export function trying<I, O1, O2>(onTry: Io<I, O1>, onCatch: Io<unknown, O2>): Io<I, O1 | O2> {
    return (input: I) => tryCatch(() => onTry(input), onCatch)
}

// Promise /////////////////////////////////////////////////////////////////////

/*
* The safest API, requiring to handle the error.
*/
export function mappingPromise<I, O1, O2>(onThen: Io<I, O1 | Promise<O1>>, onCatch: Io<unknown, O2 | Promise<O2>>): Io<Promise<I>, Promise<O1 | O2>> {
    return (input: Promise<I>) => input.then(onThen).catch(onCatch)
}

/*
* Sugar API, for easy prototyping.
*/
export function then<I, O1>(onThen: Io<I, O1 | Promise<O1>>, onCatch?: never): Io<Promise<I>, Promise<O1>>
export function then<I, O1, O2>(onThen: Io<I, O1 | Promise<O1>>, onCatch: Io<unknown, O2 | Promise<O2>>): Io<Promise<I>, Promise<O1 | O2>>
export function then<I, O1, O2>(onThen: Io<I, O1 | Promise<O1>>, onCatch?: Io<unknown, O2 | Promise<O2>>): Io<Promise<I>, Promise<O1 | O2>> {
    return ! onCatch
        ? (input: Promise<I>) => input.then(onThen)
        : (input: Promise<I>) => input.then(onThen).catch(onCatch)
}

/*
* Utility API, mapping the fulfillment.
*/
export function awaiting<I, O>(onThen: Io<I, O | Promise<O>>): Io<Promise<I>, Promise<O>> {
    return (input: Promise<I>) => input.then(onThen)
}

/*
* Utility API, mapping the rejection.
*/
export function catching<I, O>(onCatch: Io<unknown, O | Promise<O>>): Io<Promise<I>, Promise<I | O>> {
    return (input: Promise<I>) => input.catch(onCatch)
}

/*
* Shortcut API. Same of catching(ResultError).
*/
export function catchingError<I>(error?: None | never): Io<Promise<I>, Promise<I | ResultError<unknown>>>
export function catchingError<I, O>(error: O): Io<Promise<I>, Promise<I | ResultError<O>>>
export function catchingError<I, O>(errorOptional?: O): Io<Promise<I>, Promise<I | ResultError<O>>> {
    return (input: Promise<I>) => input.catch(error => asResultError(errorOptional ?? error))
}
