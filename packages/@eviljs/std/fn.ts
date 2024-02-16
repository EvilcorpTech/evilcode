export {returnVoid as noop} from './return.js'

// Used for calling callbacks inside collections.
//
// EXAMPLE
// callbacksList.forEach(call)
// // same of
// callbacksList.forEach(it => it())
export function call<R>(fn: Fn<[], R>): R
export function call<A extends FnArgs, R>(fn: Fn<A, R>, ...args: A): R
export function call<A extends FnArgs, R>(fn: Fn<A, R>, ...args: A): R {
    return fn(...args)
}

// Used for calling callbacks inside collections passing default arguments.
//
// EXAMPLE
// callbacksList.forEach(calling(arg1, arg2))
// // same of
// callbacksList.forEach(it => it(arg1, arg2))
export function calling<A extends FnArgs>(...args: A) {
    function caller<R>(fn: Fn<A, R>): R {
        return fn(...args)
    }

    return caller
}

// Binds a function to partial arguments without the need to specify `this`.
//
// EXAMPLE
// bind(fn, arg1)
// // same of
// fn.bind(undefined, arg1)
export function bind<A extends FnArgs, B extends FnArgs, R>(
    fn: (...allArgs: [...A, ...B]) => R,
    ...boundArgs: A
): (...otherArgs: B) => R {
    return fn.bind(undefined, ...boundArgs)
}

// Types ///////////////////////////////////////////////////////////////////////

export type FnArgs = Array<unknown>

export type Fn<A extends FnArgs, R = void> = (...args: A) => R
export type FnAsync<A extends FnArgs, R = void> = (...args: A) => Promise<R>

export type Io<I = unknown, O = unknown> = Fn<[input: I], O>
export type IoAsync<I, O> = Io<I, Promise<O>>

export type Task<R = void> = Fn<[], R>
export type TaskAsync<R = void> = Task<Promise<R>>
