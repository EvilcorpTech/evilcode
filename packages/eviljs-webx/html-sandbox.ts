import {tryOrNull} from '@eviljs/std/try.js'
import {onMounted, useEventListener, WebElement} from '@eviljs/web/element.js'

/*
* EXAMPLE
*
* customElements.define('html-sandbox', HtmlSandbox)
*
* <html-sandbox>
*     <style>
*         p { color: red; }
*     </style>
*
*     <p>Hello World!</p>
* </html-sandbox>
*/
export class HtmlSandbox extends WebElement {
    constructor() {
        super()

        this.attachShadow({mode: 'open'})

        onMounted(this, () => {
            const observer = new MutationObserver(() => onContentChange(this))
            observer.observe(this, {subtree: true, characterData: true})

            function unmount() {
                observer.disconnect()
            }

            return unmount
        })

        useEventListener(this, window, 'hashchange', onHashChange.bind(this, this))
    }

    override connectedCallback() {
        onContentChange(this)
    }
}

export function onContentChange(element: HTMLElement) {
    if (! element.shadowRoot) {
        return
    }

    const children = Array.from(element.childNodes)
    const html = children.map(it => it.textContent).join('\n')

    element.shadowRoot.innerHTML = html

    onHashChange(element)
}

export function onHashChange(element: HTMLElement) {
    const target = tryOrNull(() => {
        if (! element.shadowRoot) {
            return
        }
        if (! window.location.hash) {
            return
        }

        const id = window.location.hash
        const el = element.shadowRoot.querySelector<HTMLElement>(id)

        return el
    })

    if (! target) {
        return
    }

    // We can't use {behavior:'smooth'} because the Safari shim/polyfill
    // does not work inside Web Components.
    target.scrollIntoView()
}
