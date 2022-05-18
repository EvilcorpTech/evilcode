export const AnyBusEvent = '*'

export function createBus<B extends BusEvents = BusGeneric>() {
    const self: Bus<B> = {
        observers: {} as BusObserversOf<B>,

        observe(event, observer) {
            return observeEvent(self.observers, event as string, observer)
        },

        unobserve(event, observer) {
            return unobserveEvent(self.observers, event as string, observer)
        },

        emit(event, payload) {
            return emitEvent(self.observers, event as string, payload)
        },
    }

    return self
}

export function emitEvent<P>(
    observers: BusObserversGeneric,
    event: BusEvent,
    payload: P,
) {
    const eventObservers = [
        ...(observers[event] ?? []),
        ...(observers[AnyBusEvent] ?? []),
    ]

    for (const observer of eventObservers) {
        observer(payload, event)
    }
}

export function observeEvent<P>(
    observers: BusObserversGeneric,
    event: BusEvent,
    observer: BusObserver<P>,
) {
    const eventObservers = observers[event] ?? (() => {
        const eventObservers: Array<BusObserver<any>> = []
        observers[event] = eventObservers
        return eventObservers
    })()

    eventObservers.push(observer)

    function unobserve() {
        return unobserveEvent(observers, event, observer)
    }

    return unobserve
}

export function unobserveEvent<P>(
    observers: BusObserversGeneric,
    event: BusEvent,
    observer: BusObserver<P>,
) {
    const eventObservers = observers[event]

    if (! eventObservers) {
        return
    }

    observers[event] = eventObservers.filter(it => it !== observer)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Bus<B extends BusEvents> {
    observers: BusObserversOf<B>
    emit<E extends keyof B>(event: E, payload: B[E]): void
    observe<E extends keyof B>(event: E, observer: BusObserver<B[E]>): BusUnobserve
    unobserve<E extends keyof B>(event: E, observer: BusObserver<B[E]>): void
}

export type BusGeneric = Record<string, unknown>

export type BusEvent = string
export type BusEvents = {}

export type BusObserversOf<B extends BusEvents> = {
    [K in keyof B]: Array<BusObserver<B[K]>>
}
export type BusObserversGeneric = Record<BusEvent, undefined | Array<BusObserver<any>>>

export interface BusObserver<P = unknown> {
    (payload: P, key: BusEvent): void
}

export interface BusUnobserve {
    (): void
}
