import {scheduleMicroTask} from './eventloop.js'
import type {FnArgs, TaskVoid} from './fn.js'
import {isArray} from './type.js'

export const EventRegexpCache: Record<BusEvent, RegExp> = {}

export function createBus() {
    const self: Bus = {
        observers: new Map(),

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

export function emitEvent(observers: BusEventObservers, event: BusEvent, payload?: unknown): void
export function emitEvent(observers: BusEventObservers, args: [event: BusEvent, payload?: unknown]): void
export function emitEvent(observers: BusEventObservers, ...args: BusEventPolymorphicArgs): void
export function emitEvent(observers: BusEventObservers, ...polymorphicArgs: BusEventPolymorphicArgs): void {
    const eventObservers: Array<[Array<BusEventObserver>, RegExpMatchArray]> = []

    const [event, payload] = (() => {
        const [eventOrArgs, payload] = polymorphicArgs

        if (isArray(eventOrArgs)) {
            return eventOrArgs
        }

        return [eventOrArgs, payload]
    })()

    for (const entry of observers.entries()) {
        const [observedEvent, observers] = entry
        const matches = event.match(observedEvent)

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
                observer(event, matches, payload)
            }
        }
    })
}

export function observeEvent(observers: BusEventObservers, event: BusEvent, observer: BusEventObserver): TaskVoid {
    const eventObservers = observers.get(event) ?? (() => {
        const eventObservers: Array<BusEventObserver> = []
        observers.set(event, eventObservers)
        return eventObservers
    })()

    eventObservers.push(observer)

    function unobserve() {
        return unobserveEvent(observers, event, observer)
    }

    return unobserve
}

export function unobserveEvent(observers: BusEventObservers, event: BusEvent, observer: BusEventObserver): void {
    const eventObservers = observers.get(event)

    if (! eventObservers) {
        return
    }

    const observerIndex = eventObservers.indexOf(observer)

    if (observerIndex < 0) {
        return
    }

    eventObservers.splice(observerIndex, 1)
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
export type BusEventObservers = Map<BusEvent, Array<BusEventObserver>>

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
