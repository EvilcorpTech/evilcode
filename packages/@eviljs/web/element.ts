export class WebElement extends HTMLElement {
    #hooksState: WebElementHooksState = {
        mounted: [],
        unmounted: [],
    }

    // constructor() {
    //     super()
    // }

    connectedCallback(): void {
        runTasksQueue(this.#hooksState.mounted)
    }

    disconnectedCallback(): void {
        runTasksQueue(this.#hooksState.unmounted)

        this.#hooksState.unmounted = []
    }

    getHooksState(): WebElementHooksState {
        return this.#hooksState
    }
}

export function onMounted(element: WebElement, fn: OnMountedFn): void {
    const unmountedTask = fn()

    if (! unmountedTask) {
        return
    }

    element.getHooksState().unmounted.push(unmountedTask)
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

        function onUnmount() {
            target.removeEventListener(type, listener, options)
        }

        return onUnmount
    })
}

// Tools ///////////////////////////////////////////////////////////////////////

export function runTasksQueue(queue: Array<Function>): void {
    for (const it of queue) {
        it()
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface WebElementHooksState {
    mounted: Array<Function>
    unmounted: Array<Function>
}

export interface OnMountedFn {
    (): Function | void
}

export interface OnUnmountedFn {
    (): void
}
