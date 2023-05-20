import type {TaskVoid} from './fn.js'

export function scheduleMicroTask(task: TaskVoid): TaskVoid {
    let canceled = false

    Promise.resolve().then(() => {
        if (canceled) {
            return
        }

        task()
    })

    function cancel() {
        canceled = true
    }

    return cancel
}

export function scheduleMacroTask(task: TaskVoid): TaskVoid {
    const timeoutId = setTimeout(task, 0)

    function cancel() {
        clearTimeout(timeoutId)
    }

    return cancel
}
