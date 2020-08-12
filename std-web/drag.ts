import {isNil} from '@eviljs/std-lib/type'

export function createDragElement(tag?: DragTags, style?: DragStyler) {
    const el = document.createElement(tag ?? 'div')
    el.classList.add('drag-r710dd')
    el.style.position = 'absolute'
    el.style.top = '0'
    el.style.left = '0'
    el.style.right = '0'
    el.style.bottom = '0'
    style?.(el)
    return el
}

export function attachDragListeners(el: DragElement, listeners: DragListeners) {
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

export function mountDragElement(el: Element, region?: Element) {
    const root = region ?? document.body

    root.appendChild(el)

    function unmount() {
        root.removeChild(el)
    }

    return unmount
}

// Move ////////////////////////////////////////////////////////////////////////

export const MoveStrategy = 'transform'

export function initMoveState(element: DragMoveElement, event: DragMouseEvent, options?: DragMoveOptions<DragMoveElement>): DragMoveState<DragMoveElement, DragMoveElement> {
    const strategy = (element instanceof SVGGraphicsElement)
        ? 'svg'
        : (options?.strategy ?? MoveStrategy)
    const horizontal = options?.horizontal ?? true
    const vertical = options?.vertical ?? true
    const initialX = event.clientX
    const initialY = event.clientY
    const state = {element, options, strategy, horizontal, vertical, initialX, initialY} as const

    switch (strategy) {
        case 'absolute':
            return {...state, ...initMoveAbsoluteState(element as HTMLElement, event, options as DragMoveOptions<HTMLElement>)} as const
        break
        case 'transform':
            return {...state, ...initMoveTransformState(element as HTMLElement, event, options as DragMoveOptions<HTMLElement>)} as const
        break
        case 'svg':
            return {...state, ...initMoveSvgState(element as SVGAElement, event, options as DragMoveOptions<SVGGraphicsElement>)} as const
        break
    }
}

export function initMoveAbsoluteState(el: HTMLElement, event: DragMouseEvent, options?: DragMoveOptions<HTMLElement>) {
    const initialLeft = el.offsetLeft
    const initialTop = el.offsetTop
    const minLeft = options?.minLeft ?? (options?.bound
        ? 0
        : undefined
    )
    const maxLeft = options?.maxLeft ?? (options?.bound
        ? options.bound.offsetWidth - el.offsetWidth
        : undefined
    )
    const minTop = options?.minTop ?? (options?.bound
        ? 0
        : undefined
    )
    const maxTop = options?.maxTop ?? (options?.bound
        ? options.bound.offsetHeight - el.offsetHeight
        : undefined
    )
    const moveRatio = 1

    return {initialLeft, initialTop, minLeft, maxLeft, minTop, maxTop, moveRatio} as const
}

export function initMoveTransformState(el: HTMLElement, event: DragMouseEvent, options?: DragMoveOptions<HTMLElement>) {
    const [translateX, translateY] = getComputedTransform(el).slice(-2)
    const initialLeft = translateX ?? 0
    const initialTop = translateY ?? 0
    const boundRect = options?.bound?.getBoundingClientRect()
    const elRect = options?.bound && el.getBoundingClientRect()
    const minLeft = options?.minLeft ?? (elRect && boundRect
        ? boundRect?.left - elRect.left + initialLeft
        : undefined
    )
    const maxLeft = options?.maxLeft ?? (elRect && boundRect
        ? boundRect.right - elRect.right + initialLeft
        : undefined
    )
    const minTop = options?.minTop ?? (elRect && boundRect
        ? boundRect?.top - elRect.top + initialTop
        : undefined
    )
    const maxTop = options?.maxTop ?? (elRect && boundRect
        ? boundRect.bottom - elRect.bottom + initialTop
        : undefined
    )
    const moveRatio = 1

    return {initialLeft, initialTop, minLeft, maxLeft, minTop, maxTop, moveRatio} as const
}

export function initMoveSvgState(el: SVGGraphicsElement, event: DragMouseEvent, options?: DragMoveOptions<SVGGraphicsElement>) {
    const svg = el.ownerSVGElement!
    const moveRatio =
        (svg.viewBox.baseVal.width || svg.clientWidth)
        /
        svg.clientWidth
    const {e: translateX, f: translateY} = el.transform.baseVal.consolidate()?.matrix ?? {}
    const initialLeft = translateX ?? 0
    const initialTop = translateY ?? 0
    const boundRect = options?.bound?.getBoundingClientRect()
    const elRect = options?.bound && el.getBoundingClientRect()
    const minLeft = options?.minLeft ?? (elRect && boundRect
        ? (boundRect?.left - elRect.left) * moveRatio + initialLeft
        : undefined
    )
    const maxLeft = options?.maxLeft ?? (elRect && boundRect
        ? (boundRect.right - elRect.right) * moveRatio + initialLeft
        : undefined
    )
    const minTop = options?.minTop ?? (elRect && boundRect
        ? (boundRect?.top - elRect.top) * moveRatio + initialTop
        : undefined
    )
    const maxTop = options?.maxTop ?? (elRect && boundRect
        ? (boundRect.bottom - elRect.bottom) * moveRatio + initialTop
        : undefined
    )

    return {initialLeft, initialTop, minLeft, maxLeft, minTop, maxTop, moveRatio} as const
}

export function move(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragMouseEvent) {
    switch (state.strategy) {
        case 'absolute':
            return moveAbsolute(state as DragMoveState<HTMLElement, HTMLElement>, event)
        break
        case 'transform':
            return moveTransform(state as DragMoveState<HTMLElement, HTMLElement>, event)
        break
        case 'svg':
            return moveSvg(state as DragMoveState<SVGGraphicsElement, SVGGraphicsElement>, event)
        break
    }
}

export function moveAbsolute(state: DragMoveState<HTMLElement, HTMLElement>, event: DragMouseEvent) {
    const size = computeMove(state, event)

    if (size && 'left' in size) {
        state.element.style.left = size.left + 'px'
    }
    if (size && 'top' in size) {
        state.element.style.top = size.top + 'px'
    }

    return size
}

export function moveTransform(state: DragMoveState<HTMLElement, HTMLElement>, event: DragMouseEvent) {
    const size = computeMove(state, event)

    if (! size) {
        return
    }

    const [a, b, c, d, x, y] = getComputedTransform(state.element)
    const matrix = [
        a ?? 1,
        b ?? 0,
        c ?? 0,
        d ?? 1,
        size.left ?? state.initialLeft,
        size.top ?? state.initialTop,
    ].join(',')

    state.element.style.transform = `matrix(${matrix})`

    return size
}

export function moveSvg(state: DragMoveState<SVGGraphicsElement, SVGGraphicsElement>, event: DragMouseEvent) {
    const size = computeMove(state, event)

    if (! size) {
        return
    }

    const left = size.left ?? state.initialLeft
    const top = size.top ?? state.initialTop
    const transform = state.element.transform.baseVal.consolidate()
        ?? state.element.ownerSVGElement!.createSVGTransform()

    transform.setTranslate(left, top)

    state.element.transform.baseVal.clear()
    state.element.transform.baseVal.appendItem(transform)

    return size
}

export function computeMove(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragMouseEvent): DragMoveChange {
    const size = {
        left: state.horizontal
            ? computeMoveHorizontal(state, event)
            : undefined
        ,
        top: state.vertical
            ? computeMoveVertical(state, event)
            : undefined
        ,
    }
    const change = {...size}

    if (change.left === state.initialLeft || change.left === undefined) {
        delete change.left
    }
    if (change.top === state.initialTop || change.top === undefined) {
        delete change.top
    }

    const sizeChanged = ('left' in change) || ('top' in change)

    if (sizeChanged) {
        return change
    }

    return // Makes TypeScript happy.
}

export function computeMoveHorizontal(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragMouseEvent) {
    const {initialLeft, initialX, minLeft, maxLeft, moveRatio} = state
    const deltaX = (event.clientX - initialX) * moveRatio
    const nextLeft = initialLeft + deltaX

    if (! isNil(minLeft) && nextLeft < minLeft) {
        return minLeft
    }
    if (! isNil(maxLeft) && nextLeft > maxLeft) {
        return maxLeft
    }
    return nextLeft
}

export function computeMoveVertical(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragMouseEvent) {
    const {initialTop, initialY, minTop, maxTop, moveRatio} = state
    const deltaY = (event.clientY - initialY) * moveRatio
    const nextTop = initialTop + deltaY

    if (! isNil(minTop) && nextTop < minTop) {
        return minTop
    }
    if (! isNil(maxTop) && nextTop > maxTop) {
        return maxTop
    }
    return nextTop
}

export function getComputedTransform(el: HTMLElement) {
    const {transform} = getComputedStyle(el)

    if (! transform || transform === 'none') {
        return []
    }

    const matrix = transform
        .replace('(', ',')
        .replace(')', '')
        .split(',')
        .slice(1)
        .map(parseFloat)

    return matrix
}

// Resize //////////////////////////////////////////////////////////////////////

export function initResizeState(element: DragResizeElement, event: DragMouseEvent, options?: DragResizeOptions) {
    const horizontalDirection =
        (options?.horizontal === 'forward')
            ? 1
        : (options?.horizontal === 'backward')
            ? -1
        : 0
    const verticalDirection =
        (options?.vertical === 'forward')
            ? 1
        : (options?.vertical === 'backward')
            ? -1
        : 0
    const initialX = event.clientX
    const initialY = event.clientY
    const initialWidth = element.offsetWidth
    const initialHeight = element.offsetHeight
    const minWidth = options?.minWidth ?? 0
    const maxWidth = options?.maxWidth
    const minHeight = options?.minHeight ?? 0
    const maxHeight = options?.maxHeight

    return {
        element,
        horizontalDirection, verticalDirection,
        initialX, initialY,
        initialWidth, initialHeight,
        minWidth, maxWidth,
        minHeight, maxHeight,
    } as const
}

export function resize(state: DragResizeState, event: DragMouseEvent) {
    const size = computeResize(state, event)

    if (size && 'width' in size) {
        state.element.style.width = size.width + 'px'
    }
    if (size && 'height' in size) {
        state.element.style.height = size.height + 'px'
    }

    return size
}

export function computeResize(state: DragResizeState, event: DragMouseEvent): DragResizeChange {
    const size = {
        width: state.horizontalDirection
            ? computeResizeHorizontal(state, event)
            : undefined
        ,
        height: state.verticalDirection
            ? computeResizeVertical(state, event)
            : undefined
        ,
    }
    const change = {...size}

    if (change.width === state.initialWidth || change.width === undefined) {
        delete change.width
    }
    if (change.height === state.initialHeight || change.height === undefined) {
        delete change.height
    }

    const sizeChanged = ('width' in change) || ('height' in change)

    if (sizeChanged) {
        return change
    }

    return // Makes TypeScript happy.
}

export function computeResizeHorizontal(state: DragResizeState, event: DragMouseEvent) {
    const {horizontalDirection, initialWidth, initialX, minWidth, maxWidth} = state
    const deltaX = (event.clientX - initialX) * horizontalDirection
    const nextWidth = initialWidth + deltaX

    if (! isNil(minWidth) && nextWidth < minWidth) {
        return minWidth
    }
    if (! isNil(maxWidth) && nextWidth > maxWidth) {
        return maxWidth
    }
    return nextWidth
}

export function computeResizeVertical(state: DragResizeState, event: DragMouseEvent) {
    const {verticalDirection, initialHeight, initialY, minHeight, maxHeight} = state
    const deltaY = (event.clientY - initialY) * verticalDirection
    const nextHeight = initialHeight + deltaY

    if (! isNil(minHeight) && nextHeight < minHeight) {
        return minHeight
    }
    if (! isNil(maxHeight) && nextHeight > maxHeight) {
        return maxHeight
    }
    return nextHeight
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DragOptions {
}

export interface DragMoveOptions<B extends DragMoveElement> extends DragOptions {
    readonly strategy?: Exclude<DragMoveStrategy, 'svg'>
    readonly horizontal?: boolean
    readonly vertical?: boolean
    readonly bound?: B | null
    readonly minLeft?: number
    readonly maxLeft?: number
    readonly minTop?: number
    readonly maxTop?: number
}

export interface DragResizeOptions extends DragOptions {
    readonly horizontal?: 'forward' | 'backward'
    readonly vertical?: 'forward' | 'backward'
    readonly minWidth?: number
    readonly maxWidth?: number
    readonly minHeight?: number
    readonly maxHeight?: number
}

export interface DragStyler {
    (el: DragElement): void
}

export interface DragListeners {
    onMouseMove(event: MouseEvent): void
    onMouseLeave(event: MouseEvent): void
    onMouseUp(event: MouseEvent): void
}

export interface DragState<E, O extends DragOptions> {
    readonly element: E
    readonly options?: O
}

export interface DragMoveState<E extends DragMoveElement, B extends DragMoveElement> extends DragState<E, DragMoveOptions<B>> {
    readonly strategy: DragMoveStrategy
    readonly horizontal: boolean
    readonly vertical: boolean
    readonly initialX: number
    readonly initialY: number
    readonly initialLeft: number
    readonly initialTop: number
    readonly minLeft?: number
    readonly maxLeft?: number
    readonly minTop?: number
    readonly maxTop?: number
    readonly moveRatio: number
}

export interface DragResizeState extends DragState<DragResizeElement, DragResizeOptions> {
    readonly horizontalDirection: number
    readonly verticalDirection: number
    readonly initialX: number
    readonly initialY: number
    readonly initialWidth: number
    readonly initialHeight: number
    readonly minWidth?: number
    readonly maxWidth?: number
    readonly minHeight?: number
    readonly maxHeight?: number
}

export type DragMoveChange = undefined | {
    left?: number
    top?: number
}

export type DragResizeChange = undefined | {
    width?: number
    height?: number
}

export interface DragMouseEvent {
    readonly clientX: number
    readonly clientY: number
}

export type DragMoveStrategy = 'absolute' | 'transform' | 'svg'

export type DragTags = keyof HTMLElementTagNameMap
export type DragElement = HTMLElement
export type DragMoveElement = HTMLElement | SVGGraphicsElement
export type DragResizeElement = HTMLElement
