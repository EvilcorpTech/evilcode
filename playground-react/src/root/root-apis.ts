export function attachRootElement(): Element {
    const existingRootElement = Array.from(document.body.children).find(it =>
        it.classList.contains('Root')
    )

    if (existingRootElement) {
        return existingRootElement
    }

    const rootElement = document.createElement('div')
    rootElement.classList.add('Root')
    document.body.prepend(rootElement)
    return rootElement
}
