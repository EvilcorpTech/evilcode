import type {Task} from './fn.js'

export function scheduleMicroTaskUsingPromise(task: Task): Task {
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

export function scheduleMicroTaskUsingMutationObserver(task: Task): Task {
    let canceled = false

    function taskCancelable() {
        if (canceled) {
            return
        }

        task()
    }

    const observer = new MutationObserver(taskCancelable)
    const node = document.createTextNode('')
    observer.observe(node, {characterData: true})
    node.data = ''

    function cancel() {
        canceled = true
    }

    return cancel
}

export function scheduleMacroTaskUsingTimeout(task: Task): Task {
    const timeoutId = setTimeout(task, 0)

    function cancel() {
        clearTimeout(timeoutId)
    }

    return cancel
}

let PostMessageInit = false
export let PostMessageId = '@eviljs/std/eventloop.scheduleMacroTaskWithPostMessage()'
export const PostMessageQueue: Array<Task> = []

export function scheduleMacroTaskUsingPostMessage(task: Task): Task {
    let canceled = false

    if (! PostMessageInit) {
        PostMessageInit = true

        window.addEventListener(
            'message',
            event => {
                if (event.source !== window) {
                    return
                }
                if (event.data !== PostMessageId) {
                    return
                }

                event.stopImmediatePropagation()

                const selectedTask = PostMessageQueue.shift()
                selectedTask?.()
            },
            {capture: true, passive: true},
        )
    }

    function taskCancelable() {
        if (canceled) {
            return
        }

        task()
    }

    PostMessageQueue.push(taskCancelable)
    window.postMessage(PostMessageId, '*')

    function cancel() {
        canceled = true
    }

    return cancel
}

export function scheduleMacroTaskUsingMessageChannel(task: Task): Task {
    let canceled = false

    function taskCancelable() {
        if (canceled) {
            return
        }

        task()
    }

    const channel = new MessageChannel()
    channel.port1.onmessage = taskCancelable
    channel.port2.postMessage(0)

    function cancel() {
        canceled = true
    }

    return cancel
}
