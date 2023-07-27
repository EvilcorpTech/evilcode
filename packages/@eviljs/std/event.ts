import type {Fn, FnArgs} from './fn.js'
import {isDefined, isUndefined} from './type.js'

export function debounce<A extends FnArgs>(task: Fn<A>, delay: number) {
    interface State {
        lastCallArgs: A
        lastCallTime: undefined | number
        timeoutId: undefined | ReturnType<typeof setTimeout>
    }
    const state: State = {
        lastCallArgs: [] as unknown as A,
        lastCallTime: undefined,
        timeoutId: undefined,
    }

    function callTask(...args: A) {
        state.lastCallArgs = args
        state.lastCallTime = Date.now()

        if (isDefined(state.timeoutId)) {
            return
        }

        state.timeoutId = setTimeout(runTask, delay)
    }

    function cancelTask() {
        if (isUndefined(state.timeoutId)) {
            return
        }

        clearTimeout(state.timeoutId)
        state.timeoutId = undefined
    }

    function runTask() {
        const timeElapsed = Date.now() - state.lastCallTime!
        const timeIsExpired = timeElapsed >= delay

        if (! timeIsExpired) {
            const delayRemaining = delay - timeElapsed
            state.timeoutId = setTimeout(runTask, delayRemaining)
            return
        }

        state.timeoutId = undefined
        task(...state.lastCallArgs)
    }

    callTask.cancel = cancelTask

    return callTask
}

export function throttle<A extends FnArgs>(task: Fn<A>, delay: number) {
    interface State {
        lastCallArgs: A
        timeoutId: undefined | ReturnType<typeof setTimeout>
    }
    const state: State = {
        lastCallArgs: [] as unknown as A,
        timeoutId: undefined,
    }

    function callTask(...args: A) {
        state.lastCallArgs = args

        if (isDefined(state.timeoutId)) {
            return
        }

        task(...args)
        state.timeoutId = setTimeout(runTask, delay)
    }

    function cancelTask() {
        if (isUndefined(state.timeoutId)) {
            return
        }

        clearTimeout(state.timeoutId)
        state.timeoutId = undefined
    }

    function runTask() {
        state.timeoutId = undefined
        task(...state.lastCallArgs)
    }

    callTask.cancel = cancelTask

    return callTask
}
