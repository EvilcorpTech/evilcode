import {isArray, isString} from './type.js'

export function safeArray(value: unknown) {
        return isArray(value) ? value : []
}

export function safeString(value: unknown) {
    return isString(value) ? value : ''
}

export function safeType(type: ArrayConstructor, value: unknown): Array<unknown>
export function safeType(type: StringConstructor, value: unknown): string
export function safeType(type: ArrayConstructor | StringConstructor, value: unknown) {
    switch (type) {
        case Array: return safeArray(value)
        case String: return safeString(value)
    }
    return // Makes TypeScript happy.
}
