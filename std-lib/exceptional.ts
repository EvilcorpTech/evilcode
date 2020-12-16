import {isNil} from './type.js'

export function tryOrNull<R>(fn: () => R, args?: [], ctx?: unknown): R | null
export function tryOrNull<R, A extends Array<unknown>>(fn: (...args: A) => R, args: A, ctx?: unknown): R | null
export function tryOrNull<R, A extends Array<unknown>>(fn: (...args: A) => R, args: A, ctx?: unknown): R | null {
    try {
        return fn(...args ?? [])
    }
    catch (error) {
        console.warn(error, ctx)
        return null
    }
}

export function tryMap<I, R>(items: undefined | null | Array<I>, fn: (it: I, idx: number) => R | null | undefined) {
    if (! items) {
        return []
    }

    const itemsWithNulls = items.map((it, idx) =>
        tryOrNull(fn, [it, idx], it)
    )
    const itemsWithoutNulls = itemsWithNulls.filter(it => ! isNil(it)) as Array<R>

    return itemsWithoutNulls
}
