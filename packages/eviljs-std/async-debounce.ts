export function debounce<A extends Array<unknown>>(task: (...args: A) => void, delay: number) {
    const state: State = {
        args: null,
        callTime: null,
        timeoutId: null,
    }
    interface State {
        args: null | A
        callTime: null | number
        timeoutId: null | number
    }

    function call(...args: A) {
        state.args = args
        state.callTime = Date.now()

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
        const elapsedTime = Date.now() - state.callTime!
        const isTimeExpired = elapsedTime >= delay

        if (isTimeExpired) {
            state.timeoutId = null
            task(...state.args!)
        }
        else {
            const remainingDelay = delay - elapsedTime
            state.timeoutId = setTimeout(run, remainingDelay)
        }
    }

    call.cancel = cancel

    return call
}
