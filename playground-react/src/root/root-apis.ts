export const RootId = 'AppRoot'
export const RootNode = setupRootElement()

export function setupRootElement(): HTMLElement {
    return findRootElement() ?? attachRootElement(createRootElement())
}

export function attachRootElement(element: HTMLElement) {
    document.body.prepend(element)
    return element
}

export function createRootElement(): HTMLElement {
    const element = document.createElement('div')
    element.id = RootId
    element.classList.add('std-root', 'std-text')
    return element
}

export function findRootElement(): undefined | HTMLElement {
    return document.getElementById(RootId) ?? undefined
}

export function isRootElement(element: Element): element is HTMLElement {
    return element.id === RootId
}
