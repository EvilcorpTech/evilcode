import {scheduleMicroTask} from './eventloop.js'
import type {FnArgs, TaskVoid} from './fn.js'
import {makeReactive, type ReactiveValue} from './reactive.js'
import {isArray} from './type.js'

export const EventRegexpCache: Record<BusEvent, RegExp> = {}

export function createBus() {
    const self: Bus = {
        observers: makeReactive({}),

        emit(...args: BusEventPolymorphicArgs) {
            return emitEvent(self.observers, ...args)
        },

        observe(event, observer) {
            return observeEvent(self.observers, event, observer)
        },

        unobserve(event, observer) {
            return unobserveEvent(self.observers, event, observer)
        },
    }

    return self
}

export function emitEvent(reactiveObservers: BusEventObservers, event: BusEvent, payload?: unknown): void
export function emitEvent(reactiveObservers: BusEventObservers, args: [event: BusEvent, payload?: unknown]): void
export function emitEvent(reactiveObservers: BusEventObservers, ...args: BusEventPolymorphicArgs): void
export function emitEvent(reactiveObservers: BusEventObservers, ...polymorphicArgs: BusEventPolymorphicArgs): void {
    const observers = reactiveObservers.read()
    const eventObservers: Array<[Array<BusEventObserver>, RegExpMatchArray]> = []

    const [emittedEvent, emittedPayload] = (() => {
        const [eventOrArgs, payload] = polymorphicArgs

        if (isArray(eventOrArgs)) {
            return eventOrArgs
        }

        return [eventOrArgs, payload]
    })()

    for (const entry of Object.entries(observers)) {
        const [event, observers] = entry
        const matches = emittedEvent.match(event)

        if (! matches) {
            continue
        }

        eventObservers.push([observers, matches])
    }

    if (eventObservers.length === 0) {
        return
    }

    scheduleMicroTask(() => {
        for (const entry of eventObservers) {
            const [observersGroup, matches] = entry

            for (const observer of observersGroup) {
                observer(emittedEvent, matches, emittedPayload)
            }
        }
    })
}

export function observeEvent(reactiveObservers: BusEventObservers, event: BusEvent, observer: BusEventObserver): TaskVoid {
    const observers = reactiveObservers.read()
    const eventObservers = observers[event] ?? []

    reactiveObservers.write({
        ...observers,
        [event]: [...eventObservers, observer],
    })

    function unobserve() {
        return unobserveEvent(reactiveObservers, event, observer)
    }

    return unobserve
}

export function unobserveEvent(reactiveObservers: BusEventObservers, event: BusEvent, observer: BusEventObserver): void {
    const observers = reactiveObservers.read()
    const eventObservers = observers[event]

    if (! eventObservers) {
        return
    }
    if (! eventObservers.includes(observer)) {
        return
    }

    reactiveObservers.write({
        ...observers,
        [event]: eventObservers.filter(it => it !== observer),
    })
}

export function defineBusEvent<
    const C,
    EI extends FnArgs,
    EO extends string | [string, unknown],
    TI extends FnArgs,
>(
    shared: C,
    define: (shared: C) => BusEventDescriptor<EI, EO, TI>,
): BusEventDescriptor<EI, EO, TI> {
    return define(shared)
}

export function regexpFromEvent(event: BusEvent): RegExp {
    if (! EventRegexpCache[event]) {
        EventRegexpCache[event] = new RegExp(event)
    }

    return EventRegexpCache[event]!
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Bus {
    observers: BusEventObservers
    emit(event: BusEvent, payload?: unknown): void
    emit(args: [event: BusEvent, payload?: unknown]): void
    emit(...args: BusEventPolymorphicArgs): void
    observe(event: BusEvent, observer: BusEventObserver): TaskVoid
    unobserve(event: BusEvent, observer: BusEventObserver): void
}

export type BusEvent = string
export type BusEventObservers = ReactiveValue<Record<BusEvent, Array<BusEventObserver>>>

export interface BusEventObserver {
    (event: BusEvent, matches: RegExpMatchArray, payload: unknown): void
}

export type BusEventPolymorphicArgs =
    | [event: BusEvent, payload?: unknown]
    | [[event: BusEvent, payload?: unknown]]

export interface BusEventDescriptor<
    EI extends FnArgs,
    EO extends string | [string, unknown],
    TI extends FnArgs,
> {
    event(...args: EI): EO
    topic(...args: TI): string
}

export type BusEventPayloadOf<
    D extends BusEventDescriptor<
        Array<any>,
        string | [string, unknown],
        Array<any>
    >
> =
    D extends BusEventDescriptor<
        Array<any>,
        [string, infer P],
        Array<any>
    >
        ? P
        : undefined
