import type {Task} from './fn.js'

export function scheduleMicroTask(task: Task): Task {
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

export function scheduleMacroTask(task: Task): Task {
    const timeoutId = setTimeout(task, 0)

    function cancel() {
        clearTimeout(timeoutId)
    }

    return cancel
}
