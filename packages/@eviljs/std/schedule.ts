export function createScheduler(task: () => void, delay: number, options: SchedulerOptions) {
    const self: Scheduler = {
        delay: delay,
        immediate: options?.immediate ?? true,
        running: false,
        task: task,
        destructor: NoOp,

        start() {
            return start(self)
        },
        stop() {
            return stop(self)
        },
    }

    return self
}

export function start(scheduler: Scheduler) {
    if (scheduler.running) {
        // Already running. We have nothing to do.
        return scheduler.stop
    }

    scheduler.running = true

    if (scheduler.immediate) {
        execute(scheduler)
    }
    else {
        scheduler.destructor = schedule(scheduler)
    }

    return scheduler.stop
}

export function stop(scheduler: Scheduler) {
    scheduler.running = false

    scheduler.destructor()
    scheduler.destructor = NoOp
}

export function schedule(scheduler: Scheduler) {
    if (! scheduler.running) {
        // Loop has been stopped. We must not reschedule a new execution.
        return NoOp
    }

    const id = setTimeout(execute, scheduler.delay, scheduler)

    function cancel() {
        clearTimeout(id)
    }

    return cancel
}

export function execute(scheduler: Scheduler) {
    const result = scheduler.task()
    const promise = Promise.resolve(result)

    function onTaskCompletion() {
        scheduler.destructor = schedule(scheduler)
    }

    promise.then(onTaskCompletion, onTaskCompletion)
}

export function NoOp() {}

// Types ///////////////////////////////////////////////////////////////////////

export interface Scheduler {
    delay: number
    immediate: boolean
    running: boolean
    task: Function
    destructor: Function
    start(): void
    stop(): void
}

export interface SchedulerOptions {
    immediate?: boolean
}
