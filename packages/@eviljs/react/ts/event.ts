import {debounced, throttled, type EventTask} from '@eviljs/std/fn-event'
import type {Fn, FnArgs} from '@eviljs/std/fn-type'
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import type {StateInit, StateSetter} from './state.js'

export function useCallbackDebounced<A extends FnArgs>(callback: Fn<A>, delayMs: number): EventTask<A> {
    const callbackDebounced = useMemo(() => {
        return debounced(callback, delayMs)
    }, [callback, delayMs])

    useEffect(() => {
        function onClean() {
            callbackDebounced.cancel()
        }

        return onClean
    }, [callbackDebounced])

    return callbackDebounced
}

export function useCallbackThrottled<A extends FnArgs>(callback: Fn<A>, delayMs: number): EventTask<A> {
    const callbackThrottled = useMemo(() => {
        return throttled(callback, delayMs)
    }, [callback, delayMs])

    useEffect(() => {
        function onClean() {
            callbackThrottled.cancel()
        }

        return onClean
    }, [callbackThrottled])

    return callbackThrottled
}

export function useCallbackDelayed(callback: Function, delayMs: number): {
    start(): void
    cancel(): void
} {
    const taskRef = useRef<ReturnType<typeof setTimeout>>()

    const cancel = useCallback(() => {
        if (! taskRef.current) {
            return
        }

        taskRef.current = void clearTimeout(taskRef.current)
    }, [])

    const start = useCallback(() => {
        cancel()

        taskRef.current = setTimeout(callback, delayMs)
    }, [cancel, callback])

    useLayoutEffect(() => {
        // We use useLayoutEffect() to conform with React 17 hooks lifecycle.
        return cancel
    }, [cancel])

    return {start, cancel}
}

export function useStateDebounced<T>(initialValue: undefined, delay: number): [undefined | T, StateSetter<undefined | T>]
export function useStateDebounced<T>(initialValue: StateInit<T>, delay: number): [T, StateSetter<T>]
export function useStateDebounced<T>(initialValue: undefined | T, delay: number): [undefined | T, StateSetter<undefined | T>] {
    const [value, setValue] = useState(initialValue)
    const setValueDebounced = useCallbackDebounced(setValue, delay)

    return [value, setValueDebounced]
}

export function useStateThrottled<T>(initialValue: undefined, delay: number): [undefined | T, StateSetter<undefined | T>]
export function useStateThrottled<T>(initialValue: StateInit<T>, delay: number): [T, StateSetter<T>]
export function useStateThrottled<T>(initialValue: undefined | StateInit<T>, delay: number): [undefined | T, StateSetter<undefined | T>] {
    const [value, setValue] = useState(initialValue)
    const setValueThrottled = useCallbackThrottled(setValue, delay)

    return [value, setValueThrottled]
}

export function useValueDebounced<V>(input: V, delay: number): V {
    const [output, setOutput] = useState(input)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setOutput(input)
        }, delay)

        function onClean() {
            clearTimeout(timeoutId)
        }

        return onClean
    }, [input])

    return output
}
