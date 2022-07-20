import {isObject} from './type.js'

export const ErrorTag: symbol = Symbol('Error')

export function Error<E>(error: E): Error<E> {
    return {[ErrorTag]: true, error} as Error<E>
}

export function isError(error: unknown): error is Error<unknown> {
    if (! isObject(error)) {
        return false
    }
    return ErrorTag in error
}

// Types ///////////////////////////////////////////////////////////////////////

export type Result<E extends Error<unknown>, V> = E | V

export interface Error<E> {
    error: E
    [key: symbol]: true
}
