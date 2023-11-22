export const RootDefaultId = 'AppRoot'
export const RootDataAttrName = 'app-root'

export function setupRootElement(id: string, classes?: undefined | Array<string>): HTMLElement {
    return findRootElement(id) ?? attachRootElement(createRootElement(id, classes))
}

export function attachRootElement(element: HTMLElement) {
    document.body.prepend(element)
    return element
}

export function createRootElement(id: string, classes?: undefined | Array<string>): HTMLElement {
    const element = document.createElement('div')
    element.setAttribute(`data-${RootDataAttrName}`, '')
    element.id = id
    element.classList.add(...classes ?? [])
    return element
}

export function findRootElement(id: string): undefined | HTMLElement {
    return document.getElementById(id) ?? undefined
}

export function isRootElement(element: HTMLElement): element is HTMLElement {
    return element.hasAttribute(`data-${RootDataAttrName}`)
}
