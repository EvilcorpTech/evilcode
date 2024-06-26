import type {TaskAsync} from '@eviljs/std/fn-type.js'
import {AsyncTasksQueue, createAsyncTasksQueue, type AsyncTasksQueueState} from '@eviljs/std/lab/async-tasks-queue.js'
import type {SsrResult} from './ssr.js'
import type {KoaContext} from './types.js'

export enum SsrJobPriority {
    High = 0,
    Low = 1,
}

export const SsrJobsQueue = {
    highPriority: createAsyncTasksQueue<undefined | SsrResult>(),
    lowPriority: createAsyncTasksQueue<undefined | SsrResult>(),
}

export function getSsrJobsQueue(priority: SsrJobPriority): AsyncTasksQueueState<undefined | SsrResult> {
    switch (priority) {
        case SsrJobPriority.High:
            return SsrJobsQueue.highPriority
        case SsrJobPriority.Low:
            return SsrJobsQueue.lowPriority
    }
}

export function getSsrJobsLimit(ctx: KoaContext, priority: SsrJobPriority): number {
    const {ssrSettings} = ctx

    switch (priority) {
        case SsrJobPriority.High:
            return ssrSettings.ssrProcessesLimitWithHighPriority
        case SsrJobPriority.Low:
            return ssrSettings.ssrProcessesLimitWithLowPriority
    }
}

export function scheduleSsrJob(
    ctx: KoaContext,
    priority: SsrJobPriority,
    job: TaskAsync<undefined | SsrResult>,
): Promise<undefined | SsrResult> {
    const jobsQueue = getSsrJobsQueue(priority)
    const jobsLimit = getSsrJobsLimit(ctx, priority)

    if (jobsQueue.limit !== jobsLimit) {
        jobsQueue.limit = jobsLimit
    }

    const queue = getSsrJobsQueue(priority)
    const promise = AsyncTasksQueue.enqueueTask(queue, job)

    return promise
}
