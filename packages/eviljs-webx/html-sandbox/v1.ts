import {useEventListener, WebElement} from '@eviljs/web/element.js'

// EXAMPLE
// customElements.define('html-sandbox', HtmlSandbox)
//
// <html-sandbox>
//     <style>
//         p { color: red; }
//     </style>
//
//     <p>Hello World!</p>
// </html-sandbox>
export class HtmlSandbox extends WebElement {
    constructor() {
        super()
        const self = this
        const shadowRoot = this.attachShadow({mode: 'open'})
        const slot = document.createElement('slot')
        const container = document.createElement('div')

        slot.style.display = 'none'
        container.style.display = 'contents'

        shadowRoot.appendChild(slot)
        shadowRoot.appendChild(container)

        function onContentChange() {
            const children = slot.assignedNodes()
            const html = children.map(it => it.textContent).join('\n')

            container.innerHTML = html

            onHashChange(self)
        }

        slot.addEventListener('slotchange', (event) => void onContentChange())
        const observer = new MutationObserver((mutations, observer) => void onContentChange())
        observer.observe(this, {characterData: true, childList: true, subtree: true})

        useEventListener(this, window, 'hashchange', onHashChange.bind(this, this))
    }
}

export function onHashChange(element: HTMLElement) {
    if (! element.shadowRoot) {
        return
    }
    if (! window.location.hash) {
        return
    }

    const target = (() => {
        try {
            return element.shadowRoot.querySelector<HTMLElement>(window.location.hash)
        }
        catch (error) {
            return
        }
    })()

    if (! target) {
        return
    }

    // We can't use {behavior:'smooth'} because the Safari shim/polyfill
    // does not work inside Web Components.
    target.scrollIntoView()
}
