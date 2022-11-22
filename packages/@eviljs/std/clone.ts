import {isArray, isObject} from './type.js'

export function cloneShallow<T>(value: T): T {
    if (isArray(value)) {
        return [...value] as unknown as T
    }
    if (isObject(value)) {
        return {...value} as unknown as T
    }
    return value
}

export function cloneDate(date: Date) {
    return new Date(date.getTime())
}
