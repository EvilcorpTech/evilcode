import { ValueOf } from '@eviljs/std-lib/type'

export const ResizeDirection = {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
    Both: 'both',
}

export function resize(el: ResizeElement, state: ResizeInitialState, event: MouseEvent, options?: ResizeOptions) {
    const size = {width: state.initialWidth, height: state.initialHeight}

    switch (options?.direction ?? ResizeDirection.Both) {
        case ResizeDirection.Horizontal:
            size.width = resizeHorizontal(el, state, event, options)
            break
        case ResizeDirection.Vertical:
            size.height = resizeVertical(el, state, event, options)
            break
        case ResizeDirection.Both:
            size.width = resizeHorizontal(el, state, event, options)
            size.height = resizeVertical(el, state, event, options)
            break
    }

    const sizeChanged =
        (size.width !== state.initialWidth)
        || (size.height !== state.initialHeight)

    if (sizeChanged) {
        return size
    }

    return
}

export function resizeHorizontal(el: ResizeElement, state: ResizeInitialState, event: MouseEvent, options?: ResizeOptions) {
    const { initialWidth, initialX } = state
    const deltaX = event.clientX - initialX
    const nextWidth = initialWidth + deltaX

    if (nextWidth < (options?.minWidth ?? 0)) {
        return initialWidth
    }
    if (options?.maxWidth && nextWidth > options?.maxWidth) {
        return initialWidth
    }

    el.style.width = nextWidth + 'px'

    return nextWidth
}

export function resizeVertical(el: ResizeElement, state: ResizeInitialState, event: MouseEvent, options?: ResizeOptions) {
    const { initialHeight, initialY } = state
    const deltaY = event.clientY - initialY
    const nextHeight = initialHeight + deltaY

    if (nextHeight < (options?.minHeight ?? 0)) {
        return initialHeight
    }
    if (options?.maxHeight && nextHeight > options?.maxHeight) {
        return initialHeight
    }

    el.style.height = nextHeight + 'px'

    return nextHeight
}

export function createResizeElement(tag?: ResizeTags, styler?: ResizeStyler) {
    const el = document.createElement(tag ?? 'div')
    el.classList.add('r710ddb8-resizer')
    el.style.position = 'absolute'
    el.style.top = '0'
    el.style.left = '0'
    el.style.right = '0'
    el.style.bottom = '0'
    styler?.(el)
    return el
}

export function attachResizeListeners(el: ResizeElement, listeners: ResizeListeners) {
    el.addEventListener('mousemove', listeners.onMouseMove, {capture: false, passive: true})
    el.addEventListener('mouseleave', listeners.onMouseLeave, {capture: false, passive: true})
    el.addEventListener('mouseup', listeners.onMouseUp, {capture: false, passive: true})

    function unmount() {
        el.removeEventListener('mousemove', listeners.onMouseMove, false)
        el.removeEventListener('mouseleave', listeners.onMouseLeave, false)
        el.removeEventListener('mouseup', listeners.onMouseUp, false)
    }

    return unmount
}

export function mountResizeElement(el: Element, region?: Element) {
    const root = region ?? document.body

    root.appendChild(el)

    function unmount() {
        root.removeChild(el)
    }

    return unmount
}

export function readElementSize(element: Element) {
    const width = element.clientWidth
    const height = element.clientHeight

    return {width, height}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ResizeOptions {
    direction?: ValueOf<typeof ResizeDirection>
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
}

export interface ResizeStyler {
    (el: ResizeElement): void
}

export interface ResizeListeners {
    onMouseMove(event: MouseEvent): void
    onMouseLeave(event: MouseEvent): void
    onMouseUp(event: MouseEvent): void
}

export interface ResizeInitialState {
    initialWidth: number
    initialHeight: number
    initialX: number
    initialY: number
}

export type ResizeElement = HTMLElement
export type ResizeTags = keyof HTMLElementTagNameMap
