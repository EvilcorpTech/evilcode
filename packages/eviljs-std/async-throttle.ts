export function throttle<A extends Array<unknown>>(task: (...args: A) => void, delay: number) {
    const state: State = {
        args: null,
        timeoutId: null,
    }
    interface State {
        args: null | A
        timeoutId: null | number
    }

    function call(...args: A) {
        state.args = args

        if (state.timeoutId !== null) {
            return
        }

        state.timeoutId = setTimeout(run, delay)
    }

    function cancel() {
        if (state.timeoutId === null) {
            return
        }

        clearTimeout(state.timeoutId)
    }

    function run() {
        state.timeoutId = null
        task(...state.args!)
    }

    call.cancel = cancel

    return call
}
