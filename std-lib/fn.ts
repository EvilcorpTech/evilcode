import { isArray, isNil, isObject, objectWithoutUndefined } from './type'

export function times(count: number) {
    return Array(count).fill(undefined).map((nil, idx) => idx)
}

// export function* iterate(count: number) {
//     let idx = 0
//
//     while (idx < count) {
//         yield idx
//         ++idx
//     }
// }

/*
* Creates a function which does not invoke the wrapped one when receives a nil
* (null or undefined) value.
*
* EXAMPLE
* const fn = skipNil((value: number) => 100 / value)
* fn(50) // 2
* fn(null) // undefined
*/
export function skipNil<V, A extends Array<unknown>, R>(fn: (value: V, ...args: A) => R) {
    function decorator(value: V, ...args: A) {
        if (isNil(value)) {
            return value
        }
        const result = fn(value, ...args)
        return result
    }

    return decorator
}

/*
* Creates a function which excludes properties with undefined values from the
* returned object.
*
* EXAMPLE
* const fn = excludeUndefined((age?: number) => ({
*     name: 'John',
*     age: age,
* }))
* fn(42) // {name:'John', age:42}
* fn()   // {name:'John'}
*/
export function excludeUndefined<A extends Array<unknown>, R>(fn: (...args: A) => R) {
    function decorator(...args: A) {
        const result = fn(...args)
        if (isObject(result)) {
            return objectWithoutUndefined(result)
        }
        return result
    }

    return decorator
}

/*
* Creates a function that can be used to map a single value or an array of values.
*
* EXAMPLE
* const fn = mapArray((it: number) => it * 2)
* fn(5) // 10
* fn([1, 2, 4]) // [2, 4, 8]
*/
export function mapArray<V, A extends Array<unknown>, R>(fn: (value: V, ...args: A) => R) {
    function decorator(value: Array<V> | V, ...args: A) {
        if (isArray(value)) {
            const result = value.map(it => fn(it, ...args))
            return result
        }
        const result = fn(value, ...args)
        return result
    }

    return decorator
}

export function wrap
    <A extends Array<unknown>, R = unknown>
    (fn: (...args: A) => R, decorators: Array<Decorator>)
{
    const wrapped = decorators.reduce((fn, decorate) =>
        decorate(fn)
    , fn)

    return wrapped as Fn<A, R>
}

// Types ///////////////////////////////////////////////////////////////////////

export type Decorator = (fn: Fn) => Fn

export type Fn
    <A extends Array<any> = Array<any>, R = any>
    = (...args: A) => R
