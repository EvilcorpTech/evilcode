import {isArray, isObject} from './type-is.js'

export function areEqualIdentity<T>(a: T, b: T): boolean {
    return a === b
}

export function areEqualDeepSerializable(a: any, b: any): boolean {
    const aString = JSON.stringify(a)
    const bString = JSON.stringify(b)
    return aString === bString
}

export function cloneShallow<T>(value: T): T {
    if (isArray(value)) {
        return [...value] as unknown as T
    }
    if (isObject(value)) {
        return {...value} as unknown as T
    }
    return value
}

export function cloneDeep<T>(value: T): T {
    return structuredClone(value)
}

export function cloneDeepSerializable<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T
}
