import {isFunction, isNil, isObject} from './type.js'
import {objectWithoutUndefined} from './object.js'

/*
* Stores an item inside an object, returning the object. Useful when used inside
* an Array.reduce() function.
*
* EXAMPLE
* [{id: 123, value: 'A'}, {id: 234, value: 'B'}].reduce(indexBy.bind(null, 'id'))
* const index = indexBy('id', {}, {id: '123', asd: 123})
*/
export function indexBy
    <
        B extends string,
        T extends {[key in B]: string | number},
    >
    (
        by: B | ((item: T) => string | number),
        index: Record<string | number, T>,
        item: T,
    )
{
    const key = isFunction(by)
        ? by(item)
        : item[by as keyof typeof item] as unknown as string

    index[key] = item

    return index
}

/*
* Stores an item inside an object, indexed by its id, returning the object.
* Useful when used inside an Array.reduce() function.
*
* EXAMPLE
* [{id: 123, value: 'A'}, {id: 234, value: 'B'}].reduce(indexById)
*/
export function indexById
    <T extends {id: string | number}>
    (
        index: Record<string | number, T>,
        item: T,
    )
{
    return indexBy('id', index, item)
}

/*
* Creates a function which excludes properties with undefined values from the
* returned object.
*
* EXAMPLE
* const fn = excludeUndefinedWith((age?: number) => ({
*     name: 'John',
*     age: age,
* }))
* fn(42) // {name:'John', age:42}
* fn()   // {name:'John'}
*/
export function excludeUndefinedWith<A extends Array<unknown>, R>(fn: (...args: A) => R) {
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
* Creates a function which does not invoke the wrapped one when receives a nil
* (null or undefined) value.
*
* EXAMPLE
* const fn = skipNilWith((value: number) => 100 / value)
* fn(50) // 2
* fn(null) // undefined
*/
export function skipNilWith<V, A extends Array<unknown>, R>(fn: (value: V, ...args: A) => R) {
    function decorator(value: V, ...args: A) {
        if (isNil(value)) {
            return value
        }
        const result = fn(value, ...args)
        return result
    }

    return decorator
}

// Types ///////////////////////////////////////////////////////////////////////
