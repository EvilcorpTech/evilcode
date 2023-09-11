import type {Fn, FnArgs, Task} from './fn.js'
import {isDefined, isUndefined} from './type.js'

export function debounced<A extends FnArgs>(task: Fn<A>, delay: number): EventFn<A> {
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
        if (! call.enabled) {
            return
        }

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

    function disable() {
        call.enabled = false
        cancel()
    }

    function enable() {
        call.enabled = true
    }

    call.enabled = true
    call.cancel = cancel
    call.disable = disable
    call.enable = enable

    return call
}

export function throttled<A extends FnArgs>(task: Fn<A>, delay: number): EventFn<A> {
    interface State {
        lastCallArgs: undefined | A
        timeoutId: undefined | ReturnType<typeof setTimeout>
    }

    const state: State = {
        lastCallArgs: undefined,
        timeoutId: undefined,
    }

    function call(...args: A) {
        if (! call.enabled) {
            return
        }

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

    function disable() {
        call.enabled = false
        cancel()
    }

    function enable() {
        call.enabled = true
    }

    call.enabled = true
    call.cancel = cancel
    call.disable = disable
    call.enable = enable

    return call
}

// Types ///////////////////////////////////////////////////////////////////////

export interface EventFn<A extends FnArgs = [], R = void> extends Fn<A, R> {
    cancel: Task
    disable: Task
    enable: Task
    readonly enabled: boolean
}
