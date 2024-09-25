import type {Fn, FnArgs} from './fn-type.js'

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
export function calling<A extends FnArgs>(...args: A): <R>(fn: Fn<A, R>) => R {
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
