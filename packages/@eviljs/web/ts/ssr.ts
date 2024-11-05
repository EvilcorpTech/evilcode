import {mapSome} from '@eviljs/std/fn-monad'
import {deserializeStruct, serializeStruct} from '@eviljs/std/serial'

export {deserializeStruct as deserializeSsrState, serializeStruct as serializeSsrState} from '@eviljs/std/serial'

export function saveSsrState(id: string, payload: unknown, options?: undefined | SsrSaveOptions): void {
    if (! payload) {
        return
    }

    const inject = options?.inject ?? injectSsrStorageElement
    const ssrStorage = findSsrStorageElement(id) ?? inject(id)

    serializeSsrStateIntoStorageElement(ssrStorage, payload, options?.serializer)
}

export function serializeSsrStateIntoStorageElement(
    element: Element,
    payload: unknown,
    serializerOptional?: undefined | SsrPayloadSerializer,
): void {
    const serialize: SsrPayloadSerializer = serializerOptional ?? serializeStruct

    element.textContent = serialize(payload) ?? null
}

export function loadSsrState(id: string, options?: undefined | SsrLoadOptions): unknown {
    const ssrStorage = findSsrStorageElement(id)

    return ssrStorage
        ? deserializeSsrStateFromStorageElement(ssrStorage, options?.deserializer)
        : undefined
}

export function deserializeSsrStateFromStorageElement(
    element: Element,
    deserializeOptional?: undefined | SsrPayloadDeserializer,
): unknown {
    const deserialize: SsrPayloadDeserializer = deserializeOptional ?? deserializeStruct
    const payloadSerialized = readSsrStateFromStorageElement(element)

    return mapSome(payloadSerialized, deserialize)
}

export function findSsrStorageElement(id: string): undefined | Element {
    const ssrElementsSelector = 'script[type="application/json"][data-type="ssr-data"]'
    const ssrElements = document.querySelectorAll(ssrElementsSelector)
    const ssrElement = Array.from(ssrElements).find(it => it.id === id)

    return ssrElement
}

export function injectSsrStorageElement(id: string): HTMLScriptElement {
    const element = createSsrStorageElement(id)

    document.body.appendChild(element)

    return element
}

export function createSsrStorageElement(id: string): HTMLScriptElement {
    const element = document.createElement('script')

    element.type = 'application/json'
    element.dataset.type = 'ssr-data'
    element.id = id

    return element
}

export function readSsrStateFromStorageElement(element: Element): undefined | string {
    return element.textContent?.trim() || undefined
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SsrSaveOptions {
    inject?: undefined | ((id: string) => Element)
    serializer?: undefined | SsrPayloadSerializer
}

export interface SsrLoadOptions {
    deserializer?: undefined | SsrPayloadDeserializer
}

export interface SsrPayloadSerializer {
    (payload: unknown): undefined | string
}

export interface SsrPayloadDeserializer {
    (payloadSerialized: string): unknown
}
