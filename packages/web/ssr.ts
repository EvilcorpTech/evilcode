export const SsrIdPrefix = 'std-ssr-'

export function saveSsrState(id: string, payload: any, options?: SsrOptions) {
    if (! payload) {
        return
    }

    const ssrId = formatSsrId(id, options)
    const serializedPayload = JSON.stringify(payload)
    const inject = options?.inject ?? injectSsrStorageElement
    const ssrStorage = findSsrStorageElement(ssrId) ?? inject()

    ssrStorage.id = ssrId
    ssrStorage.textContent = serializedPayload
}

export function loadSsrState<S = unknown>(id: string, options?: SsrOptions) {
    const ssrId = formatSsrId(id, options)
    const ssrStorage = findSsrStorageElement(ssrId)
    const serializedPayload = ssrStorage?.textContent?.trim()

    if (! serializedPayload) {
        return
    }

    return JSON.parse(serializedPayload) as S
}

export function formatSsrId(id: string, options?: SsrOptions) {
    return options?.formatId
        ? options.formatId(id)
        : SsrIdPrefix + id
}

export function findSsrStorageElement(id: string) {
    const selector = '#' + id
    return document.querySelector(selector)
}

export function injectSsrStorageElement() {
    const el = document.createElement('script')
    el.type = 'application/json'
    document.body.appendChild(el)
    return el
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SsrOptions {
    formatId?(id: string): string
    inject?(): Element
}
