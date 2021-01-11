import {isNumber} from '@eviljs/std-lib/type.js'

export function attachDragListeners(el: DragElement, listeners: DragListeners) {
    const eventOptions = {capture: false, passive: false}

    function onMouseMove(event: MouseEvent) {
        listeners.onPointerMove(event)
    }
    function onTouchMove(event: TouchEvent) {
        if (event.cancelable) {
            event.preventDefault() // Prevents firing the mousemove event.
        }
        listeners.onPointerMove(event)
    }

    function onMouseUp(event: MouseEvent) {
        listeners.onPointerEnd(event)
    }
    function onTouchEnd(event: TouchEvent) {
        event.preventDefault() // Prevents firing the mouseup event.
        listeners.onPointerEnd(event)
    }

    function onMouseLeave(event: MouseEvent) {
        listeners.onPointerCancel(event)
    }
    function onTouchCancel(event: TouchEvent) {
        event.preventDefault() // Prevents firing the mouseleave event.
        listeners.onPointerCancel(event)
    }

    el.addEventListener('mousemove', onMouseMove, eventOptions)
    el.addEventListener('touchmove', onTouchMove, eventOptions)
    el.addEventListener('mouseup', onMouseUp, eventOptions)
    el.addEventListener('touchend', onTouchEnd, eventOptions)
    el.addEventListener('mouseleave', onMouseLeave, eventOptions)
    el.addEventListener('touchcancel', onTouchCancel, eventOptions)

    function unmount() {
        el.removeEventListener('mousemove', onMouseMove, eventOptions.capture)
        el.removeEventListener('touchmove', onTouchMove, eventOptions.capture)
        el.removeEventListener('mouseup', onMouseUp, eventOptions.capture)
        el.removeEventListener('touchend', onTouchEnd, eventOptions.capture)
        el.removeEventListener('mouseleave', onMouseLeave, eventOptions.capture)
        el.removeEventListener('touchcancel', onTouchCancel, eventOptions.capture)
    }

    return unmount
}

// Move ////////////////////////////////////////////////////////////////////////

export const MoveDefaultStrategy = 'transform'

export function initMoveState(element: DragMoveElement, event: DragEvent, options?: DragMoveOptions<DragMoveElement>): DragMoveState<DragMoveElement, DragMoveElement> {
    const strategy = (element instanceof SVGGraphicsElement)
        ? 'svg'
        : (options?.strategy ?? MoveDefaultStrategy)
    const horizontal = options?.horizontal ?? true
    const vertical = options?.vertical ?? true
    const pointerEvent = asDragPointerEvent(event)
    const initialX = pointerEvent.clientX
    const initialY = pointerEvent.clientY
    const state = {element, options, strategy, horizontal, vertical, initialX, initialY} as const

    switch (strategy) {
        case 'absolute':
            return {...state, ...initMoveAbsoluteState(element as HTMLElement, event, options as DragMoveOptions<HTMLElement>)}
        break
        case 'transform':
            return {...state, ...initMoveTransformState(element as HTMLElement, event, options as DragMoveOptions<HTMLElement>)}
        break
        case 'svg':
            return {...state, ...initMoveSvgState(element as SVGAElement, event, options as DragMoveOptions<SVGGraphicsElement>)}
        break
    }
}

export function initMoveAbsoluteState(el: HTMLElement, event: DragEvent, options?: DragMoveOptions<HTMLElement>) {
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

    return {initialLeft, initialTop, minLeft, maxLeft, minTop, maxTop, moveRatio}
}

export function initMoveTransformState(el: HTMLElement, event: DragEvent, options?: DragMoveOptions<HTMLElement>) {
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

    return {initialLeft, initialTop, minLeft, maxLeft, minTop, maxTop, moveRatio}
}

export function initMoveSvgState(el: SVGGraphicsElement, event: DragEvent, options?: DragMoveOptions<SVGGraphicsElement>) {
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

    return {initialLeft, initialTop, minLeft, maxLeft, minTop, maxTop, moveRatio}
}

export function move(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragEvent) {
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

export function moveAbsolute(state: DragMoveState<HTMLElement, HTMLElement>, event: DragEvent) {
    const size = computeMove(state, event)

    if (! size) {
        return
    }

    if (isNumber(size.left)) {
        state.element.style.left = size.left + 'px'
    }
    if (isNumber(size.top)) {
        state.element.style.top = size.top + 'px'
    }

    return size
}

export function moveTransform(state: DragMoveState<HTMLElement, HTMLElement>, event: DragEvent) {
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

export function moveSvg(state: DragMoveState<SVGGraphicsElement, SVGGraphicsElement>, event: DragEvent) {
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

export function computeMove(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragEvent): DragMoveChange {
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

export function computeMoveHorizontal(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragEvent) {
    const {initialLeft, initialX, minLeft, maxLeft, moveRatio} = state
    const pointerEvent = asDragPointerEvent(event)
    const deltaX = (pointerEvent.clientX - initialX) * moveRatio
    const nextLeft = initialLeft + deltaX

    if (isNumber(minLeft) && nextLeft < minLeft) {
        return minLeft
    }
    if (isNumber(maxLeft) && nextLeft > maxLeft) {
        return maxLeft
    }
    return nextLeft
}

export function computeMoveVertical(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragEvent) {
    const {initialTop, initialY, minTop, maxTop, moveRatio} = state
    const pointerEvent = asDragPointerEvent(event)
    const deltaY = (pointerEvent.clientY - initialY) * moveRatio
    const nextTop = initialTop + deltaY

    if (isNumber(minTop) && nextTop < minTop) {
        return minTop
    }
    if (isNumber(maxTop) && nextTop > maxTop) {
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

export function initResizeState(element: DragResizeElement, event: DragEvent, options?: DragResizeOptions): DragResizeState {
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
    const pointerEvent = asDragPointerEvent(event)
    const initialX = pointerEvent.clientX
    const initialY = pointerEvent.clientY
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
    }
}

export function resize(state: DragResizeState, event: DragEvent) {
    const size = computeResize(state, event)

    if (! size) {
        return
    }

    if (isNumber(size.width)) {
        state.element.style.width = size.width + 'px'
    }
    if (isNumber(size.height)) {
        state.element.style.height = size.height + 'px'
    }

    return size
}

export function computeResize(state: DragResizeState, event: DragEvent): DragResizeChange {
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

export function computeResizeHorizontal(state: DragResizeState, event: DragEvent) {
    const pointerEvent = asDragPointerEvent(event)
    const {horizontalDirection, initialWidth, initialX, minWidth, maxWidth} = state
    const deltaX = (pointerEvent.clientX - initialX) * horizontalDirection
    const nextWidth = initialWidth + deltaX

    if (isNumber(minWidth) && nextWidth < minWidth) {
        return minWidth
    }
    if (isNumber(maxWidth) && nextWidth > maxWidth) {
        return maxWidth
    }
    return nextWidth
}

export function computeResizeVertical(state: DragResizeState, event: DragEvent) {
    const pointerEvent = asDragPointerEvent(event)
    const {verticalDirection, initialHeight, initialY, minHeight, maxHeight} = state
    const deltaY = (pointerEvent.clientY - initialY) * verticalDirection
    const nextHeight = initialHeight + deltaY

    if (isNumber(minHeight) && nextHeight < minHeight) {
        return minHeight
    }
    if (isNumber(maxHeight) && nextHeight > maxHeight) {
        return maxHeight
    }
    return nextHeight
}

export function asDragPointerEvent(event: DragEvent): DragPointerEvent {
    return ('clientX' in event) && ('clientY' in event)
        ? {clientX: event.clientX, clientY: event.clientY}
        : {clientX: event.touches[0]!.clientX, clientY: event.touches[0]!.clientY}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DragOptions {
}

export interface DragMoveOptions<B extends DragMoveElement> extends DragOptions {
    strategy?: Exclude<DragMoveStrategy, 'svg'>
    horizontal?: boolean
    vertical?: boolean
    bound?: B | null
    minLeft?: number
    maxLeft?: number
    minTop?: number
    maxTop?: number
}

export interface DragResizeOptions extends DragOptions {
    horizontal?: 'forward' | 'backward'
    vertical?: 'forward' | 'backward'
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
}

export interface DragListeners {
    onPointerMove(event: DragEvent): void
    onPointerCancel(event: DragEvent): void
    onPointerEnd(event: DragEvent): void
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

export type DragEvent =
    | {
        readonly clientX: number
        readonly clientY: number
    }
    | {touches: TouchList}

export interface DragPointerEvent {
    clientX: number
    clientY: number
}

export type DragMoveStrategy = 'absolute' | 'transform' | 'svg'
export type DragElement = HTMLElement
export type DragMoveElement = HTMLElement | SVGGraphicsElement
export type DragResizeElement = HTMLElement
