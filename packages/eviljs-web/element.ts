const WebElementState = Symbol('WebElementState')

export class WebElement extends HTMLElement {
    [WebElementState]: {
        mounted: Array<Function>
        unmounted: Array<Function>
    }

    constructor() {
        super()

        this[WebElementState] = {mounted: [], unmounted: []}
    }

    connectedCallback() {
        runTasksQueue(this[WebElementState].mounted)
    }

    disconnectedCallback() {
        runTasksQueue(this[WebElementState].unmounted)

        this[WebElementState].unmounted = []
    }
}

// Lifecycles //////////////////////////////////////////////////////////////////

export function onMounted(element: WebElement, fn: OnMountedFn): void {
    const unmountedTask = fn()

    if (! unmountedTask) {
        return
    }

    element[WebElementState].unmounted.push(unmountedTask)
}

export function onUnmounted(element: WebElement, fn: OnUnmountedFn): void {
    onMounted(element, () => fn)
}

// Hooks ///////////////////////////////////////////////////////////////////////

export function useEventListener<T extends keyof WindowEventMap>(a: WebElement, b: Window, c: T, d: (e: WindowEventMap[T]) => any, e?: boolean | AddEventListenerOptions): void
export function useEventListener<T extends keyof DocumentEventMap>(a: WebElement, b: Document, c: T, d: (e: DocumentEventMap[T]) => any, e?: boolean | AddEventListenerOptions): void
export function useEventListener<T extends keyof HTMLElementEventMap>(a: WebElement, b: HTMLElement, c: T, d: (e: HTMLElementEventMap[T]) => any, e?: boolean | AddEventListenerOptions): void
export function useEventListener<T extends keyof SVGElementEventMap>(a: WebElement, b: SVGElement, c: T, d: (e: SVGElementEventMap[T]) => any, e?: boolean | AddEventListenerOptions): void
export function useEventListener(a: WebElement, b: Element, c: string, d: EventListener, e?: boolean | AddEventListenerOptions): void
export function useEventListener(element: WebElement, target: Window | Document | Element, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void {
    onMounted(element, () => {
        target.addEventListener(type, listener, options)

        function unmount() {
            target.removeEventListener(type, listener, options)
        }

        return unmount
    })
}

// Tools ///////////////////////////////////////////////////////////////////////

export function runTasksQueue(queue: Array<Function>) {
    for (const it of queue) {
        it()
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface OnMountedFn {
    (): Function | void
}

export interface OnUnmountedFn {
    (): void
}
