import {scheduleMicroTask} from './eventloop.js'
import type {FnArgs, Task} from './fn.js'
import {createReactiveAccessor, type ReactiveAccessor} from './reactive.js'
import {isArray} from './type.js'

export const EventRegexpCache: Record<BusEvent, RegExp> = {}

export function createBus() {
    const self: Bus = {
        observers: createReactiveAccessor({}),

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
    const observersMap = reactiveObservers.read()
    const observersNotified: Array<[Array<BusEventObserver>, RegExpMatchArray]> = []

    const [emittedEvent, emittedPayload] = (() => {
        const [eventOrArgs, payload] = polymorphicArgs

        if (isArray(eventOrArgs)) {
            return eventOrArgs
        }

        return [eventOrArgs, payload]
    })()

    for (const event in observersMap) {
        const observers = observersMap[event]

        if (! observers) {
            continue
        }

        const eventMatches = emittedEvent.match(event)

        if (! eventMatches) {
            continue
        }

        observersNotified.push([observers, eventMatches])
    }

    if (observersNotified.length === 0) {
        return
    }

    scheduleMicroTask(() => {
        for (const entry of observersNotified) {
            const [observersGroup, matches] = entry

            for (const observer of observersGroup) {
                observer(emittedEvent, matches, emittedPayload)
            }
        }
    })
}

export function observeEvent(reactiveObservers: BusEventObservers, event: BusEvent, observer: BusEventObserver): Task {
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

export function exact(pattern: string): string
export function exact(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string
export function exact(...args: [string] | [TemplateStringsArray, ...Array<unknown>]): string {
    const [strings, substitutions] = args

    return isArray(strings)
        ? exactTemplate(strings as TemplateStringsArray, substitutions as Array<unknown>)
        : exactString(strings as string)
}

export function exactString(pattern: string) {
    return `^${pattern}$`
}

export function exactTemplate(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string {
    return exactString(String.raw(strings, ...substitutions))
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
    observe(event: BusEvent, observer: BusEventObserver): Task
    unobserve(event: BusEvent, observer: BusEventObserver): void
}

export type BusEvent = string
export type BusEventObservers = ReactiveAccessor<Record<BusEvent, Array<BusEventObserver>>>

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
