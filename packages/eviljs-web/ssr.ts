export function saveSsrState(id: string, payload: any, options?: SsrOptions) {
    if (! payload) {
        return
    }

    const serializedPayload = JSON.stringify(payload)
    const inject = options?.inject ?? injectSsrStorageElement
    const ssrStorage = findSsrStorageElement(id) ?? inject(id)

    ssrStorage.textContent = serializedPayload
}

export function loadSsrState<S = unknown>(id: string, options?: SsrOptions) {
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
