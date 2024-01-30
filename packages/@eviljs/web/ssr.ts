export function saveSsrState(id: string, payload: unknown, options?: undefined | SsrSaveOptions) {
    if (! payload) {
        return
    }

    const inject = options?.inject ?? injectSsrStorageElement
    const ssrStorage = findSsrStorageElement(id) ?? inject(id)

    serializeSsrStateIntoElement(ssrStorage, payload)
}

export function serializeSsrStateIntoElement(element: Element, payload: unknown) {
    const serializedPayload = JSON.stringify(payload)

    element.textContent = serializedPayload
}

export function loadSsrState(id: string, options?: undefined | SsrLoadOptions): unknown {
    const ssrStorage = findSsrStorageElement(id)

    return ssrStorage
        ? deserializeSsrStateFromElement(ssrStorage)
        : undefined
}

export function deserializeSsrStateFromElement(element: Element): unknown {
    const serializedPayload = element.textContent?.trim()

    if (! serializedPayload) {
        return
    }

    return JSON.parse(serializedPayload) as unknown
}

export function findSsrStorageElement(id: string): undefined | Element {
    const ssrElementsSelector = 'script[type="application/json"][data-type="ssr-data"]'
    const ssrElements = document.querySelectorAll(ssrElementsSelector)
    const ssrElement = Array.from(ssrElements).find(it => it.id === id)

    return ssrElement
}

export function injectSsrStorageElement(id: string) {
    const element = createSsrStorageElement(id)

    document.body.appendChild(element)

    return element
}

export function createSsrStorageElement(id: string) {
    const element = document.createElement('script')

    element.type = 'application/json'
    element.dataset.type = 'ssr-data'
    element.id = id

    return element
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SsrSaveOptions {
    inject?: undefined | ((id: string) => Element)
}

export interface SsrLoadOptions {
}
