import {isArray, isString} from './type.js'

export function safeArray<T extends Array<unknown>>(value: T): T
export function safeArray(value: unknown): Array<unknown>
export function safeArray(value: unknown): Array<unknown> {
    return isArray(value) ? value : []
}

export function safeString<T extends string>(value: T): T
export function safeString(value: unknown): unknown
export function safeString(value: unknown): string {
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
