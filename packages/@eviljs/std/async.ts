import {isArray, isFunction, isObject} from './type.js'
import {throwInvalidArgument} from './throw.js'

export function wait(delay: number) {
    const promise = new Promise((resolve) =>
        setTimeout(resolve, delay)
    )

    return promise
}

export function play(timeline: AsyncTimeline): Promise<unknown> {
    if (isFunction(timeline)) {
        return timeline()
    }
    if (isArray(timeline)) {
        return Promise.all(
            timeline.map(play),
        )
    }
    if (isObject(timeline)) {
        return Promise.all(
            Object.values(timeline).map(play),
        )
    }

    return throwInvalidArgument(
        '@eviljs/std/async.play(~~timeline~~):\n'
        + `timeline must be a Function | Object | Array, given "${timeline}".`
    )
}

export class PromiseCancellable<T = unknown> extends Promise<T> {
    cancelled: boolean = false

    cancel() {
        this.cancelled = true
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export type AsyncTimeline<R = unknown> =
    | AsyncTimelineTask<R>
    | AsyncTimelineSequence<R>
    | AsyncTimelineParallel<R>
    | Readonly<AsyncTimelineParallel<R>>

export interface AsyncTimelineTask<R = unknown> {
    (): Promise<R>
}

export interface AsyncTimelineSequence<R = unknown> extends Array<AsyncTimeline<R>> {
}

export interface AsyncTimelineParallel<R = unknown> {
    [key: PropertyKey]: AsyncTimeline<R>
}
