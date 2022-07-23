import {debounce, Task, throttle} from '@eviljs/std/event.js'
import {computeValue} from '@eviljs/std/fn.js'
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'

export {debounce, throttle, type Task} from '@eviljs/std/event.js'

export function useDebounce<A extends Array<unknown>>(task: Task<A>, delay: number) {
    const taskDebounced = useMemo(() => {
        return debounce(task, delay)
    }, [task, delay])

    useLayoutEffect(() => {
        function onClean() {
            taskDebounced.cancel()
        }

        return onClean
    }, [taskDebounced])

    return taskDebounced
}

export function useThrottle<A extends Array<unknown>>(task: Task<A>, delay: number) {
    const taskThrottled = useMemo(() => {
        return throttle(task, delay)
    }, [task, delay])

    useLayoutEffect(() => {
        function onClean() {
            taskThrottled.cancel()
        }

        return onClean
    }, [taskThrottled])

    return taskThrottled
}


export function useStateDebounced<T>(initialValue: undefined, delay: number): [undefined | T, React.Dispatch<React.SetStateAction<undefined | T>>]
export function useStateDebounced<T>(initialValue: T, delay: number): [T, React.Dispatch<React.SetStateAction<T>>]
export function useStateDebounced<T>(initialValue: undefined | T, delay: number): [undefined | T, React.Dispatch<React.SetStateAction<undefined | T>>] {
    const [value, setValue] = useState(initialValue)
    const setValueDebounced = useDebounce(setValue, delay)

    return [value, setValueDebounced]
}

export function useStateThrottled<T>(initialValue: undefined, delay: number): [undefined | T, React.Dispatch<React.SetStateAction<undefined | T>>]
export function useStateThrottled<T>(initialValue: T, delay: number): [T, React.Dispatch<React.SetStateAction<T>>]
export function useStateThrottled<T>(initialValue: undefined | T, delay: number): [undefined | T, React.Dispatch<React.SetStateAction<undefined | T>>] {
    const [value, setValue] = useState(initialValue)
    const setValueThrottled = useThrottle(setValue, delay)

    return [value, setValueThrottled]
}

/*
* Defers changes, but it can give immediate priority to some specific values.
*/
export function useStateDeferred<V>(
    input: V,
    delay: number,
    hasPriority?: boolean | ((input: V) => boolean),
) {
    const [output, setOutput] = useState(input)
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>()

    const setOutputDeferred = useCallback((input: V) => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current)
        }

        timeoutIdRef.current = undefined

        const valueHasPriority = computeValue(hasPriority, input) ?? false

        if (valueHasPriority) {
            setOutput(input)
        }
        else {
            const timeoutId = setTimeout(() => setOutput(input), delay)

            timeoutIdRef.current = timeoutId
        }
    }, [delay, hasPriority])

    useEffect(() => {
        setOutputDeferred(input)

        const timeoutId = timeoutIdRef.current // Supports React >= 17 cleanup strategy.

        function onClean() {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }

        return onClean
    }, [input])

    return [output, setOutputDeferred]
}
