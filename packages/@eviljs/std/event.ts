import {createCancelable, type CancelableFn} from './cancel.js'
import type {Fn, FnArgs} from './fn.js'
import {isDefined, isUndefined} from './type.js'

export function debounce<A extends FnArgs>(task: Fn<A>, delay: number): CancelableFn<A> {
    interface State {
        lastCallArgs: undefined | A
        lastCallTime: undefined | number
        timeoutId: undefined | ReturnType<typeof setTimeout>
    }

    const state: State = {
        lastCallArgs: undefined,
        lastCallTime: undefined,
        timeoutId: undefined,
    }

    function call(...args: A) {
        state.lastCallArgs = args
        state.lastCallTime = Date.now()

        if (isDefined(state.timeoutId)) {
            return
        }

        state.timeoutId = setTimeout(run, delay)
    }

    function run() {
        state.timeoutId = undefined

        if (isUndefined(state.lastCallArgs)) {
            return
        }
        if (isUndefined(state.lastCallTime)) {
            return
        }

        const timeElapsed = Date.now() - state.lastCallTime
        const timeIsExpired = timeElapsed >= delay

        if (! timeIsExpired) {
            const delayRemaining = delay - timeElapsed
            state.timeoutId = setTimeout(run, delayRemaining)
            return
        }

        task(...state.lastCallArgs)
    }

    function cancel() {
        if (isUndefined(state.timeoutId)) {
            return
        }

        clearTimeout(state.timeoutId)
        state.timeoutId = undefined
    }

    const taskCancelable = createCancelable(call, cancel)

    return taskCancelable
}

export function throttle<A extends FnArgs>(task: Fn<A>, delay: number): CancelableFn<A> {
    interface State {
        lastCallArgs: undefined | A
        timeoutId: undefined | ReturnType<typeof setTimeout>
    }

    const state: State = {
        lastCallArgs: undefined,
        timeoutId: undefined,
    }

    function call(...args: A) {
        state.lastCallArgs = args

        if (isDefined(state.timeoutId)) {
            return
        }

        state.timeoutId = setTimeout(run, delay)
    }

    function run() {
        state.timeoutId = undefined

        if (isUndefined(state.lastCallArgs)) {
            return
        }

        task(...state.lastCallArgs)
    }

    function cancel() {
        if (isUndefined(state.timeoutId)) {
            return
        }

        clearTimeout(state.timeoutId)
        state.timeoutId = undefined
    }

    const taskCancelable = createCancelable(call, cancel)

    return taskCancelable
}
