export function scheduleMicroTask(task: Task) {
    let canceled = false

    Promise.resolve().then(() => {
        if (! canceled) {
            task()
        }
    })

    function cancel() {
        canceled = true
    }

    return cancel
}

export function scheduleMacroTask(task: Task) {
    const timeoutId = setTimeout(task, 0)

    function cancel() {
        clearTimeout(timeoutId)
    }

    return cancel
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Task {
    (): void
}

export interface CancelTask {
    (): void
}
