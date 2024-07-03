import {scheduleMicroTaskUsingPromise} from './eventloop.js'
import {call} from './fn-call.js'
import type {FnArgs, Task} from './fn-type.js'
import {createReactive, readReactive, writeReactive, type ReactiveProtocol} from './reactive.js'
import {isArray} from './type-is.js'

export const BusEventRegexpCache: Record<BusEventPattern, RegExp> = {}

export function createBus() {
    const self: Bus = {
        observers: createReactive({}),

        emit(...args: BusEventPolymorphicArgs) {
            return emitBusEvent(self.observers, ...args)
        },

        observe<P = unknown>(event: BusEvent, observer: BusEventObserver<P>) {
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
    const observersMap = readReactive(reactiveObservers)
    const observersToNotify: Array<[Array<BusEventObserver>, RegExpMatchArray]> = []

    const [emittedEvent, emittedPayload] = call(() => {
        const [eventOrArgs, payload] = polymorphicArgs

        if (isArray(eventOrArgs)) {
            return eventOrArgs
        }

        return [eventOrArgs, payload]
    })

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

export function observeBusEvent(reactiveObservers: BusEventObservers, event: BusEventPattern, observer: BusEventObserver<any>): Task {
    const observersMap = readReactive(reactiveObservers)

    writeReactive(reactiveObservers, {
        ...observersMap,
        [event]: [
            ...observersMap[event] ?? [],
            observer,
        ],
    })

    function unobserve() {
        return unobserveBusEvent(reactiveObservers, event, observer)
    }

    return unobserve
}

export function unobserveBusEvent(reactiveObservers: BusEventObservers, event: BusEventPattern, observer: BusEventObserver<any>): void {
    const observersMap = readReactive(reactiveObservers)
    const eventObservers = observersMap[event]

    if (! eventObservers) {
        return
    }
    if (! eventObservers.includes(observer)) {
        return
    }

    writeReactive(reactiveObservers, {
        ...observersMap,
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
    observe<P = unknown>(event: BusEventPattern, observer: BusEventObserver<P>): Task
    unobserve(event: BusEventPattern, observer: BusEventObserver<any>): void
}

export type BusEvent = string
export type BusEventPattern = string
export type BusEventObserver<P = unknown> = (event: BusEventPattern, matches: RegExpMatchArray, payload: P) => void
export type BusEventObservers = ReactiveProtocol<Record<BusEventPattern, Array<BusEventObserver>>>

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
