import {compute} from '@eviljs/std/compute.js'
import type {EventTask} from '@eviljs/std/event.js'
import {debounce, throttle} from '@eviljs/std/event.js'
import type {FnArgs} from '@eviljs/std/fn.js'
import {useEffect, useMemo, useState} from 'react'
import type {StateInit, StateSetter} from './state.js'

export {debounce, throttle} from '@eviljs/std/event.js'
export type {EventTask} from '@eviljs/std/event.js'

export function useCallbackDebounced<A extends FnArgs>(callback: EventTask<A>, delay: number) {
    const callbackDebounced = useMemo(() => {
        return debounce(callback, delay)
    }, [callback, delay])

    useEffect(() => {
        function onClean() {
            callbackDebounced.cancel()
        }

        return onClean
    }, [callbackDebounced])

    return callbackDebounced
}

export function useCallbackThrottled<A extends FnArgs>(callback: EventTask<A>, delay: number) {
    const callbackThrottled = useMemo(() => {
        return throttle(callback, delay)
    }, [callback, delay])

    useEffect(() => {
        function onClean() {
            callbackThrottled.cancel()
        }

        return onClean
    }, [callbackThrottled])

    return callbackThrottled
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

/*
* Debounces changes, but it can give immediate priority to some specific values.
*
* EXAMPLE
*
* const busyStable = useValueDebounced(busyUnstable, 500, busy === true)
*/
export function useValueDebounced<V>(
    input: V,
    delay: number,
    isDebounced?: undefined | boolean | ((state: V) => boolean),
): V
 {
    const [output, setOutput] = useState(input)
    const debounceInput = compute(isDebounced, input) ?? true

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setOutput(input)
        }, delay)

        function onClean() {
            clearTimeout(timeoutId)
        }

        return onClean
    }, [input])

    if (! debounceInput && input !== output) {
        // We derive the state, forcing a re-render.
        setOutput(input)
    }

    if (! debounceInput) {
        return input
    }

    return output
}
