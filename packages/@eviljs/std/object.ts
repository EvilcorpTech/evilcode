import {isArray, isDefined, isObject, isUndefined} from './type.js'

export const ObjectPathArrayOpenRegexp = /\[/g
export const ObjectPathArrayCloseRegexp = /\]/g
export const ObjectPathCache: Record<string, Array<string | number>> = {}

export function isObjectEmpty(obj: object): boolean {
    for (const it in obj) {
        return false
    }
    return true
}

export function areObjectsEqualShallow<T extends object>(a: T, b: T): boolean {
    if (a === b) {
        return true
    }

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    const allKeys = new Set([...aKeys, ...bKeys])

    // Shallow equality check.
    for (const key of allKeys) {
        // A not defined property and a property with undefined value are considered equal.
        const aValue = a[key as keyof typeof a]
        const bValue = b[key as keyof typeof b]

        if (aValue !== bValue) {
            // Something changed inside the object.
            return false
        }
    }

    // Nothing changed inside the object.
    return true
}

export function areObjectsEqualShallowStrict<T extends object>(a: T, b: T): boolean {
    if (a === b) {
        return true
    }

    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)

    if (aKeys.length !== bKeys.length) {
        return false
    }

    const allKeys = new Set([...aKeys, ...bKeys])

    // Shallow equality check.
    for (const key of allKeys) {
        const aIn = key in a
        const bIn = key in b

        if (aIn !== bIn) {
            return false
        }

        const aValue = a[key as keyof typeof a]
        const bValue = b[key as keyof typeof b]

        if (aValue !== bValue) {
            // Something changed inside the object.
            return false
        }
    }

    // Nothing changed inside the object.
    return true
}

export function cloneObjectShallow<O extends object>(object: O): O {
    return Object.create(
        Object.getPrototypeOf(object),
        Object.getOwnPropertyDescriptors(object),
    )
}

export function mapObject<K extends PropertyKey, V, RK extends PropertyKey>(
    object: Record<K, V>,
    withFn: {key: MapObjectKeyFn<K, V, RK>, value?: never},
): Record<RK, V>
export function mapObject<K extends PropertyKey, V, RV>(
    object: Record<K, V>,
    withFn: {key?: never, value: MapObjectValueFn<V, K, RV>},
): Record<K, RV>
export function mapObject<K extends PropertyKey, V, RK extends PropertyKey, RV>(
    object: Record<K, V>,
    withFn: {key: MapObjectKeyFn<K, V, RK>, value: MapObjectValueFn<V, K, RV>},
): Record<RK, RV>
export function mapObject<K extends PropertyKey, V, RK extends PropertyKey, RV>(
    object: Record<K, V>,
    withFn: {key?: MapObjectKeyFn<K, V, RK>, value?: MapObjectValueFn<V, K, RV>},
): Record<K | RK, V | RV> {
    function mapper(it: [K, V]): [K | RK, V | RV] {
        const [key, value] = it
        return [
            withFn.key
                ? withFn.key(key, value)
                : key
            ,
            withFn.value
                ? withFn.value(value, key)
                : value
            ,
        ]
    }

    return Object.fromEntries(
        (Object.entries(object) as Array<[K, V]>).map(mapper)
    ) as Record<K | RK, V | RV>
}

export function mapObjectKey<K extends PropertyKey, V, RK extends PropertyKey>(
    object: Record<K, V>,
    withFn: MapObjectKeyFn<K, V, RK>,
): Record<RK, V> {
    function mapper(it: [K, V]): [RK, V] {
        const [key, value] = it
        return [withFn(key, value), value]
    }

    return Object.fromEntries(
        (Object.entries(object) as Array<[K, V]>).map(mapper)
    ) as Record<RK, V>
}

export function mapObjectValue<K extends PropertyKey, V, RV>(
    object: Record<K, V>,
    withFn: MapObjectValueFn<V, K, RV>,
): Record<K, RV> {
    function mapper(it: [K, V]): [K, RV] {
        const [key, value] = it
        return [key, withFn(value, key)]
    }

    return Object.fromEntries(
        (Object.entries(object) as Array<[K, V]>).map(mapper)
    ) as Record<K, RV>
}

export function withoutProps<O extends object, P extends keyof O>(object: O, ...props: Array<P>) {
    const obj = {...object}

    for (const prop of props) {
        delete obj[prop]
    }

    return obj as Omit<O, P>
}

export function withoutPropsUndefined<O extends object>(object: O) {
    const obj = {...object}

    for (const prop in obj) {
        if (isUndefined(obj[prop])) {
            delete obj[prop]
        }
    }

    return obj
}

export function objectFromEntry<K extends PropertyKey, V>(
    key: K,
    value: undefined | V,
): object | {[key in K]: V}
{
    return isDefined(value)
        ? {[key]: value}
        : {}
}

export function getObjectPath(root: ObjectRoot, path: ObjectPath) {
    const parts = isArray(path)
        ? path
        : fromObjectPathToParts(path)

    let node = root as unknown

    for (const part of parts) {
        if (! isObject(node) && ! isArray(node)) {
            return
        }
        node = node[part as any]
    }

    return node
}

export function fromObjectPathToParts(path: string) {
    if (! ObjectPathCache[path]) {
        ObjectPathCache[path] = path
            .replace(ObjectPathArrayOpenRegexp, '.#')
            .replace(ObjectPathArrayCloseRegexp, '')
            .split('.')
            .map(it =>
                it.startsWith('#')
                    ? Number(it.slice(1))
                    : it
            )
    }
    return ObjectPathCache[path]!
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MapObjectKeyFn<K, V, R> {
    (key: K, value: V): R
}
export interface MapObjectValueFn<V, K, R> {
    (value: V, key: K): R
}

export type ObjectRoot = Record<PropertyKey, unknown> | Array<unknown>
export type ObjectPath = string | Array<string | number>
