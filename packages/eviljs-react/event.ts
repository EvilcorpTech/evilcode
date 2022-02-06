import {debounce, Task, throttle} from '@eviljs/std/event.js'
import {useLayoutEffect, useMemo} from 'react'

export {debounce, type Task, throttle} from '@eviljs/std/event.js'

export function useDebounce<A extends Array<unknown>>(task: Task<A>, delay: number) {
    const taskDebounced = useMemo(() => {
        if (! task) {
            return
        }

        return debounce(task, delay)
    }, [task, delay])

    useLayoutEffect(() => {
        function unmount() {
            taskDebounced?.cancel()
        }

        return unmount
    }, [taskDebounced])

    return taskDebounced
}

export function useThrottle<A extends Array<unknown>>(task: Task<A>, delay: number) {
    const taskThrottled = useMemo(() => {
        if (! task) {
            return
        }

        return throttle(task, delay)
    }, [task, delay])

    useLayoutEffect(() => {
        function unmount() {
            taskThrottled?.cancel()
        }

        return unmount
    }, [taskThrottled])

    return taskThrottled
}
