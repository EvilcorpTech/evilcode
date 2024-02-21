import type {TaskAsync} from './fn-type.js'
import {throwInvalidArgument} from './throw.js'
import {isArray, isFunction, isObject} from './type.js'

export function playTimeline(timeline: TimelineAsync): Promise<unknown> {
    if (isFunction(timeline)) {
        return timeline()
    }
    if (isArray(timeline)) {
        return Promise.all(
            timeline.map(playTimeline),
        )
    }
    if (isObject(timeline)) {
        return Promise.all(
            Object.values(timeline).map(playTimeline),
        )
    }

    return throwInvalidArgument(
        '@eviljs/std/timeline.playTimeline(~~timeline~~):\n'
        + `timeline must be a Function | Object | Array, given "${timeline}".`
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export type TimelineAsync<R = unknown> =
    | TimelineTask<R>
    | TimelineSequence<R>
    | TimelineParallel<R>
    | Readonly<TimelineParallel<R>>

export type TimelineTask<R = unknown> = TaskAsync<R>
export type TimelineSequence<R = unknown> = Array<TimelineAsync<R>>

export interface TimelineParallel<R = unknown> {
    [key: PropertyKey]: TimelineAsync<R>
}
