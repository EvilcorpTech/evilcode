import {isArray, isNil, isObject, objectWithoutUndefined, ValueOf} from './type.js'

export function times(count: number) {
    return Array(count).fill(undefined).map((nil, idx) => idx)
}

/*
* Creates an iterator with an upper bound.
*
* EXAMPLE
* for (const it of iterate(10)) {
* }
*/
export function* iterate(times: number) {
    let idx = 0
    while (idx < times) {
        yield idx
        idx += 1
    }
}

export function mapObject<O extends {}, V, R>(object: O, withFn: MapObjectWith<O, R>) {
    function mapper(it: readonly [keyof O, ValueOf<O>]) {
        const [key, value] = it
        const tuple = [
            withFn.key?.(key, value) ?? key,
            withFn.value?.(value, key) ?? value,
        ] as const

        return tuple
    }

    return Object.fromEntries(
        Object.entries(object).map(mapper as any)
    )
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
* Creates a function that can be used to map a single value or an array of values.
*
* EXAMPLE
* const fn = mapArrayWith((it: number) => it * 2)
* fn(5) // 10
* fn([1, 2, 4]) // [2, 4, 8]
*/
export function mapArrayWith<V, A extends Array<unknown>, R>(fn: (value: V, ...args: A) => R) {
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

/*
* Stores an item inside an object, returning the object. Useful when used inside
* an Array.reduce() function.
*
* EXAMPLE
* [{id: 123, value: 'A'}, {id: 234, value: 'B'}].reduce(indexBy.bind(null, 'id'))
*/
export function indexBy(by: string, index: Dict, item: Dict) {
    index[item[by]] = item

    return index
}

/*
* Stores an item inside an object, indexed by its id, returning the object.
* Useful when used inside an Array.reduce() function.
*
* EXAMPLE
* [{id: 123, value: 'A'}, {id: 234, value: 'B'}].reduce(indexById)
*/
export function indexById(index: Dict, item: Dict) {
    return indexBy('id', index, item)
}

// Types ///////////////////////////////////////////////////////////////////////

export type MapObjectWith<O extends {}, R> =
    | {key: MapObjectKeyFunction<O, R>, value: MapObjectValueFunction<O, R>}
    | {key: MapObjectKeyFunction<O, R>, value?: never}
    | {key?: never, value: MapObjectValueFunction<O, R>}


export interface MapObjectKeyFunction<O extends {}, R> {
    (key: keyof O, value: ValueOf<O>): R
}
export interface MapObjectValueFunction<O extends {}, R> {
    (value: ValueOf<O>, key: keyof O): R
}

export type Decorator = (fn: Fn) => Fn

export type Fn
    <A extends Array<any> = Array<any>, R = any>
    = (...args: A) => R

export type Dict = Record<string, any>
