import {isNil} from './type.js'

export function createExceptional(reporter: ExceptionalReporter) {
    const self: Exceptional = {
        tryOrNull<R>(fn: TryOrNullArgFn<R>, ctx?: unknown) {
            return tryOrNull(fn, ctx, reporter)
        },
        tryMap<I, R>(items: TryMapArgItems<I>, fn: TryMapArgFn<I, R>) {
            return tryMap(items, fn, reporter)
        },
    }

    return self
}

export function tryOrNull<R>(fn: TryOrNullArgFn<R>, ctx?: unknown, reporter?: ExceptionalReporter): null | R {
    try {
        return fn()
    }
    catch (error) {
        reporter?.(error, ctx)
        return null
    }
}

export function tryMap<I, R>(items: TryMapArgItems<I>, fn: TryMapArgFn<I, R>, reporter?: ExceptionalReporter): Array<R> {
    if (! items) {
        return []
    }

    const itemsWithNulls = items.map((it, idx) =>
        tryOrNull(() => fn(it, idx), it, reporter)
    )
    const itemsWithoutNulls = itemsWithNulls.filter(it => ! isNil(it)) as Array<R>

    return itemsWithoutNulls
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Exceptional {
    tryOrNull<R>(fn: () => R, ctx?: unknown): null | R
    tryMap<I, R>(items: undefined | null | Array<I>, fn: (it: I, idx: number) => undefined | null | R): Array<R>
}

export interface ExceptionalReporter {
    (error: any, ctx?: unknown): void
}

export type TryOrNullArgFn<R> = () => R
export type TryMapArgItems<I> = undefined | null | Array<I>
export type TryMapArgFn<I, R> = (it: I, idx: number) => undefined | null | R
