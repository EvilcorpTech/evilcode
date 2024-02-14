import {scheduleMicroTaskUsingPromise} from './eventloop.js'
import type {FnArgs, Task} from './fn.js'
import {createReactiveAccessor, type ReactiveAccessor} from './reactive-accessor.js'
import {isArray} from './type.js'

export const BusEventRegexpCache: Record<BusEventPattern, RegExp> = {}

export function createBus() {
    const self: Bus = {
        observers: createReactiveAccessor({}),

        emit(...args: BusEventPolymorphicArgs) {
            return emitBusEvent(self.observers, ...args)
        },

        observe(event, observer) {
            return observeBusEvent(self.observers, event, observer)
        },

        unobserve(event, observer) {
            return unobserveBusEvent(self.observers, event, observer)
        },
    }

    return self
}

export function emitBusEvent(reactiveObservers: BusEventObservers, event: BusEvent, payload?: unknown): void
export function emitBusEvent(reactiveObservers: BusEventObservers, args: [event: BusEvent, payload?: unknown]): void
export function emitBusEvent(reactiveObservers: BusEventObservers, ...polymorphicArgs: BusEventPolymorphicArgs): void
export function emitBusEvent(reactiveObservers: BusEventObservers, ...polymorphicArgs: BusEventPolymorphicArgs): void {
    const observersMap = reactiveObservers.read()
    const observersToNotify: Array<[Array<BusEventObserver>, RegExpMatchArray]> = []

    const [emittedEvent, emittedPayload] = (() => {
        const [eventOrArgs, payload] = polymorphicArgs

        if (isArray(eventOrArgs)) {
            return eventOrArgs
        }

        return [eventOrArgs, payload]
    })()

    for (const eventPattern in observersMap) {
        const observers = observersMap[eventPattern]

        if (! observers) {
            continue
        }

        const eventRegexp = busEventRegexpFromPattern(eventPattern)
        const eventMatches = emittedEvent.match(eventRegexp)

        if (! eventMatches) {
            continue
        }

        observersToNotify.push([observers, eventMatches])
    }

    if (observersToNotify.length === 0) {
        return
    }

    scheduleMicroTaskUsingPromise(() => {
        for (const entry of observersToNotify) {
            const [observersGroup, matches] = entry

            for (const observer of observersGroup) {
                observer(emittedEvent, matches, emittedPayload)
            }
        }
    })
}

export function observeBusEvent(reactiveObservers: BusEventObservers, event: BusEventPattern, observer: BusEventObserver): Task {
    const observers = reactiveObservers.read()

    reactiveObservers.write({
        ...observers,
        [event]: [
            ...observers[event] ?? [],
            observer,
        ],
    })

    function unobserve() {
        return unobserveBusEvent(reactiveObservers, event, observer)
    }

    return unobserve
}

export function unobserveBusEvent(reactiveObservers: BusEventObservers, event: BusEventPattern, observer: BusEventObserver): void {
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
    EO extends BusEventDescriptorEmitArgs,
    TI extends FnArgs,
>(
    context: C,
    define: (context: C) => BusEventDescriptor<EI, EO, TI>,
): BusEventDescriptor<EI, EO, TI> {
    return define(context)
}

export function exact(pattern: string): string
export function exact(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string
export function exact(...args: [string] | [TemplateStringsArray, ...Array<unknown>]): string {
    const [strings, ...substitutions] = args

    return isArray(strings)
        ? exactTemplate(strings as TemplateStringsArray, ...substitutions)
        : exactString(strings as string)
}

export function exactString(pattern: string) {
    return `^${pattern}$`
}

export function exactTemplate(strings: TemplateStringsArray, ...substitutions: Array<unknown>): string {
    return exactString(String.raw({raw: strings}, ...substitutions))
}

export function busEventRegexpFromPattern(pattern: BusEventPattern): RegExp {
    const regexp = BusEventRegexpCache[pattern] ?? new RegExp(pattern)

    BusEventRegexpCache[pattern] ??= regexp

    return regexp
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Bus {
    observers: BusEventObservers
    emit(event: BusEvent, payload?: any): void
    emit(args: [event: BusEvent, payload?: any]): void
    emit(...args: BusEventPolymorphicArgs): void
    observe(event: BusEventPattern, observer: BusEventObserver): Task
    unobserve(event: BusEventPattern, observer: BusEventObserver): void
}

export type BusEvent = string
export type BusEventPattern = string
export type BusEventObservers = ReactiveAccessor<Record<BusEventPattern, Array<BusEventObserver>>>

export interface BusEventObserver<P = any> {
    (event: BusEventPattern, matches: RegExpMatchArray, payload: P): void
}

export type BusEventPolymorphicArgs =
    | [event: BusEvent, payload?: unknown]
    | [[event: BusEvent, payload?: unknown]]

export interface BusEventDescriptor<
    EI extends FnArgs,
    EO extends BusEventDescriptorEmitArgs,
    TI extends FnArgs,
> {
    event(...args: EI): EO
    topic(...args: TI): string
}

export type BusEventDescriptorEmitArgs = string | [string] | [string, unknown]

export type BusEventPayloadOf<
    D extends BusEventDescriptor<
        Array<any>,
        BusEventDescriptorEmitArgs,
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
