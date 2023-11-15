import type {Task} from './fn.js'

export function memoizing<R>(fn: Task<R>): Task<R> {
    let executed = false
    let value: R

    function singleton(): R {
        if (! executed) {
            executed = true
            value = fn()
        }
        return value
    }

    return singleton
}
