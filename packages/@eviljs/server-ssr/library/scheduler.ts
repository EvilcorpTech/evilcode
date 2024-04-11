import type {TaskAsync} from '@eviljs/std/fn.js'
import {createPromise} from '@eviljs/std/promise.js'

export class Scheduler<V> {
    limit = 1
    #queue = [] as Array<TaskAsync>
    #active = 0
    #timerId: undefined | ReturnType<typeof setTimeout>

    constructor(limit?: undefined | number) {
        this.limit = limit ?? this.limit
    }

    scheduleTask(task: TaskAsync<V>): Promise<V> {
        const self = this
        const {promise, resolve, reject} = createPromise<V>()

        function taskRunner(): Promise<void> {
            return task().then(resolve, reject)
        }

        self.#queue.push(taskRunner)

        self.consumeQueue()

        return promise
    }

    consumeQueue() {
        const self = this

        self.#timerId ??= setTimeout(() => {
            self.#timerId = undefined

            if (self.#active >= self.limit) {
                // A new task has been scheduled but active ones have not completed yet.
                return
            }

            while (self.#active < self.limit) {
                if (self.#queue.length === 0) {
                    // We have no queued tasks.
                    return
                }

                const nextTask = self.#queue.shift()

                if (! nextTask) {
                    // This should not happen.
                    console.warn('Scheduler.consumeQueue(): missing queued task.')
                    return
                }

                self.#active += 1
                nextTask().finally(() => {
                    self.#active -= 1

                    self.consumeQueue()
                })
            }
        }, 0)
    }
}
