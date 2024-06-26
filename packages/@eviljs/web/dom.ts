import type {Task} from '@eviljs/std/fn-type.js'

export function addEventListener<K extends keyof AbortSignalEventMap>(emitter: AbortSignal, name: K, listener: (event: AbortSignalEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof EventSourceEventMap>(emitter: EventSource, name: K, listener: (event: EventSourceEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof FileReaderEventMap>(emitter: FileReader, name: K, listener: (event: FileReaderEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof FontFaceSetEventMap>(emitter: FontFaceSet, name: K, listener: (event: FontFaceSetEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof HTMLBodyElementEventMap>(emitter: HTMLBodyElement, name: K, listener: (event: HTMLBodyElementEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof HTMLElementEventMap>(emitter: HTMLAnchorElement, name: K, listener: (event: HTMLElementEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof HTMLElementEventMap>(emitter: HTMLAreaElement, name: K, listener: (event: HTMLElementEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof HTMLMediaElementEventMap>(emitter: HTMLAudioElement, name: K, listener: (event: HTMLMediaElementEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof ElementEventMap>(emitter: Element, name: K, listener: (event: ElementEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener<K extends keyof GlobalEventHandlersEventMap>(emitter: GlobalEventHandlers, name: K, listener: (event: GlobalEventHandlersEventMap[K]) => void, options?: undefined | AddEventListenerOptions): Task
export function addEventListener(emitter: EventTarget, name: string, listener: EventListener, options?: undefined | AddEventListenerOptions): Task
export function addEventListener(
    emitter: EventTarget | GlobalEventHandlers,
    name: string,
    listener: (event: any) => void,
    options?: boolean | AddEventListenerOptions,
): Task {
    emitter.addEventListener(name, listener, options)

    function clean() {
        emitter.removeEventListener(name, listener, options)
    }

    return clean
}
