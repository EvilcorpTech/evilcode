import {scheduleMacroTaskUsingTimeout} from '../eventloop.js'
import type {Task, TaskAsync} from '../fn-type.js'
import {createPromise} from '../promise.js'

export function createAsyncTasksQueue<R>(options?: undefined | AsyncTasksQueueOptions): AsyncTasksQueueState<R> {
    const self: AsyncTasksQueueState<R> = {
        active: 0,
        limit: options?.limit ?? 1,
        queue: [],
        queueLock: undefined,
    }

    return self
}

export const AsyncTasksQueue = {
    enqueueTask<R>(self: AsyncTasksQueueState<R>, task: TaskAsync<R>): Promise<R> {
        const {promise, resolve, reject} = createPromise<R>()

        function taskRunner(): Promise<void | R> {
            return task().then(resolve, reject)
        }

        self.queue.push(taskRunner)

        AsyncTasksQueue.tryConsumingQueue(self)

        return promise
    },

    tryConsumingQueue(self: AsyncTasksQueueState<any>): void {
        self.queueLock ??= scheduleMacroTaskUsingTimeout(() => {
            self.queueLock = undefined

            if (self.active >= self.limit) {
                // A new task has been scheduled but active ones have not completed yet.
                return
            }

            while (self.active < self.limit) {
                if (self.queue.length === 0) {
                    // We have no queued tasks. We have nothing to do.
                    return
                }

                const task = self.queue.shift()

                if (! task) {
                    // This should not happen.
                    continue
                }

                // We allocate async tasks up to the `limit`.
                self.active += 1

                task().finally(() => {
                    self.active -= 1

                    // A the end of every task we try to consume the queue.
                    AsyncTasksQueue.tryConsumingQueue(self)
                })
            }
        })
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AsyncTasksQueueState<R> {
    active: number
    limit: number
    queue: Array<TaskAsync<void | R>>
    queueLock: undefined | Task
}

export interface AsyncTasksQueueOptions {
    limit?: undefined | number
}
