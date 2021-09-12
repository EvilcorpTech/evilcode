import {useCallback, useLayoutEffect, useRef} from 'react'

export function useTaskDelayed(delayMs: number, task: Function) {
    const taskRef = useRef<null | number>()

    const cancel = useCallback(() => {
        if (! taskRef.current) {
            return
        }

        clearTimeout(taskRef.current)
    }, [])

    const start = useCallback(() => {
        cancel()

        taskRef.current = setTimeout(task, delayMs)
    }, [cancel, task])

    // We use useLayoutEffect() to conform with React 17 hooks lifecycle.
    useLayoutEffect(() => {
        return cancel
    }, [cancel])

    return {start, cancel}
}
