export function saveSsrState(id: string, payload: any, options?: undefined | SsrOptions) {
    if (! payload) {
        return
    }

    const inject = options?.inject ?? injectSsrStorageElement
    const ssrStorage = findSsrStorageElement(id) ?? inject(id)
    const serializedPayload = JSON.stringify(payload)

    ssrStorage.textContent = serializedPayload
}

export function loadSsrState<S = unknown>(id: string, options?: undefined | SsrOptions) {
    const ssrStorage = findSsrStorageElement(id)
    const serializedPayload = ssrStorage?.textContent?.trim()

    if (! serializedPayload) {
        return
    }

    return JSON.parse(serializedPayload) as S
}

export function findSsrStorageElement(id: string) {
    const selector = '#' + id
    return document.querySelector(selector)
}

export function injectSsrStorageElement(id: string) {
    const el = document.createElement('script')
    el.id = id
    el.type = 'application/json'

    document.body.appendChild(el)

    return el
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SsrOptions {
    inject?(id: string): Element
}
