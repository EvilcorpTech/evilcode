import {asCancelable} from './cancel.js'
import type {Task} from './fn.js'

export function scheduleMicroTaskUsingPromise(task: Task): Task {
    const [taskCancelable, cancelTask] = asCancelable(task)

    Promise.resolve().then(taskCancelable)

    return cancelTask
}

export function scheduleMicroTaskUsingMutationObserver(task: Task): Task {
    const [taskCancelable, cancelTask] = asCancelable(task)

    const observer = new MutationObserver(taskCancelable)
    const node = document.createTextNode('')
    observer.observe(node, {characterData: true})
    node.data = ''

    return cancelTask
}

export function scheduleMacroTaskUsingTimeout(task: Task): Task {
    const timeoutId = setTimeout(task, 0)

    function cancelTask() {
        clearTimeout(timeoutId)
    }

    return cancelTask
}

let PostMessageInit = false
export let PostMessageId = '@eviljs/std/eventloop.scheduleMacroTaskWithPostMessage()'
export const PostMessageQueue: Array<Task> = []

export function scheduleMacroTaskUsingPostMessage(task: Task): Task {
    const [taskCancelable, cancelTask] = asCancelable(task)

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

    PostMessageQueue.push(taskCancelable)
    window.postMessage(PostMessageId, '*')

    return cancelTask
}

export function scheduleMacroTaskUsingMessageChannel(task: Task): Task {
    const [taskCancelable, cancelTask] = asCancelable(task)

    const channel = new MessageChannel()
    channel.port1.onmessage = taskCancelable
    channel.port2.postMessage(0)

    return cancelTask
}
