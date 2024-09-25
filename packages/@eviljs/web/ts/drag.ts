import type {Task} from '@eviljs/std/fn-type'
import {isNumber} from '@eviljs/std/type-is'

export function attachDragDraggingListeners(element: DragElement, options: DragListeners): Task {
    const eventOptions = {capture: true, passive: true} satisfies AddEventListenerOptions

    const listeners = {
        // Move ////////////////////////////////////////////////////////////////
        onMouseMoveOptions: eventOptions,
        onMouseMove(event: MouseEvent) {
            options.onPointerMove(asDragPointerEvent(event))
        },
        onTouchMoveOptions: {...eventOptions, passive: false},
        onTouchMove(event: TouchEvent) {
            if (event.cancelable) {
                event.preventDefault() // Prevents the 'touchmove' event from moving/scrolling the page on touch devices.
            }
            options.onPointerMove(asDragPointerEvent(event))
        },
        // End /////////////////////////////////////////////////////////////////
        onMouseUpOptions: eventOptions,
        onMouseUp(event: MouseEvent) {
            options.onPointerEnd(asDragPointerEvent(event))
        },
        onPointerUpOptions: eventOptions,
        onPointerUp(event: PointerEvent) {
            options.onPointerEnd(asDragPointerEvent(event))
        },
        onTouchEndOptions: eventOptions,
        onTouchEnd(event: TouchEvent) {
            options.onPointerEnd(asDragPointerEvent(event))
        },
        // Cancel //////////////////////////////////////////////////////////////
        // onMouseDownOptions: eventOptions,
        // onMouseDown(event: MouseEvent) {
        //     // Non primary mouse button (right, middle) click.
        //     options.onPointerCancel(asDragPointerEvent(event))
        // },
        // onMouseLeaveOptions: eventOptions,
        // onMouseLeave(event: MouseEvent) {
        //     options.onPointerCancel(asDragPointerEvent(event))
        // },
        onTouchCancelOptions: {...eventOptions, passive: false},
        onTouchCancel(event: TouchEvent) {
            options.onPointerCancel(asDragPointerEvent(event))
        },
    }

    element.addEventListener('mousemove', listeners.onMouseMove, listeners.onMouseMoveOptions)
    element.addEventListener('touchmove', listeners.onTouchMove, listeners.onTouchMoveOptions)
    element.addEventListener('mouseup', listeners.onMouseUp, listeners.onMouseUpOptions)
    element.addEventListener('pointerup', listeners.onPointerUp, listeners.onPointerUpOptions)
    element.addEventListener('touchend', listeners.onTouchEnd, listeners.onTouchEndOptions)
    // element.addEventListener('mousedown', listeners.onMouseDown, listeners.onMouseDownOptions)
    // element.addEventListener('mouseleave', listeners.onMouseLeave, listeners.onMouseLeaveOptions)
    element.addEventListener('touchcancel', listeners.onTouchCancel, listeners.onTouchCancelOptions)

    function onClean() {
        element.removeEventListener('mousemove', listeners.onMouseMove, listeners.onMouseMoveOptions.capture)
        element.removeEventListener('touchmove', listeners.onTouchMove, listeners.onTouchMoveOptions.capture)
        element.removeEventListener('mouseup', listeners.onMouseUp, listeners.onMouseUpOptions.capture)
        element.removeEventListener('pointerup', listeners.onPointerUp, listeners.onPointerUpOptions.capture)
        element.removeEventListener('touchend', listeners.onTouchEnd, listeners.onTouchEndOptions.capture)
        // element.removeEventListener('mousedown', listeners.onMouseDown, listeners.onMouseDownOptions.capture)
        // element.removeEventListener('mouseleave', listeners.onMouseLeave, listeners.onMouseLeaveOptions.capture)
        element.removeEventListener('touchcancel', listeners.onTouchCancel, listeners.onTouchCancelOptions.capture)
    }

    return onClean
}

// Move ////////////////////////////////////////////////////////////////////////

export const MoveStrategyDefault = 'transform'

export function initMoveState(element: DragMoveElement, event: DragPointerEvent, options?: undefined | DragMoveOptions<DragMoveElement>): DragMoveState<DragMoveElement, DragMoveElement> {
    const strategy = (element instanceof SVGGraphicsElement)
        ? 'svg'
        : (options?.strategy ?? MoveStrategyDefault)
    const horizontal = options?.horizontal ?? true
    const vertical = options?.vertical ?? true
    const initialX = event.clientX
    const initialY = event.clientY
    const state = {
        element,
        options,
        strategy,
        horizontal,
        vertical,
        initialX,
        initialY,
    } satisfies Partial<DragMoveState<DragMoveElement, DragMoveElement>>

    switch (strategy) {
        case 'absolute':
            return {...state, ...initMoveAbsoluteState(element as HTMLElement, event, options as DragMoveOptions<HTMLElement>)}
        case 'transform':
            return {...state, ...initMoveTransformState(element as HTMLElement, event, options as DragMoveOptions<HTMLElement>)}
        case 'svg':
            return {...state, ...initMoveSvgState(element as SVGAElement, event, options as DragMoveOptions<SVGGraphicsElement>)}
    }
}

export function initMoveAbsoluteState(
    element: HTMLElement,
    event: DragPointerEvent,
    options?: undefined | DragMoveOptions<HTMLElement>,
): DragMoveStateInit<HTMLElement, HTMLElement> {
    const initialLeft = element.offsetLeft
    const initialTop = element.offsetTop
    const minLeft = options?.minLeft ?? (options?.bound
        ? 0
        : undefined
    )
    const maxLeft = options?.maxLeft ?? (options?.bound
        ? options.bound.offsetWidth - element.offsetWidth
        : undefined
    )
    const minTop = options?.minTop ?? (options?.bound
        ? 0
        : undefined
    )
    const maxTop = options?.maxTop ?? (options?.bound
        ? options.bound.offsetHeight - element.offsetHeight
        : undefined
    )
    const moveRatio = 1

    return {
        initialLeft,
        initialTop,
        minLeft,
        maxLeft,
        minTop,
        maxTop,
        moveRatio,
    }
}

export function initMoveTransformState(
    element: HTMLElement,
    event: DragPointerEvent,
    options?: undefined | DragMoveOptions<HTMLElement>,
): DragMoveStateInit<HTMLElement, HTMLElement> {
    const [translateX, translateY] = getComputedTransform(element).slice(-2)
    const initialLeft = translateX ?? 0
    const initialTop = translateY ?? 0
    const boundRect = options?.bound?.getBoundingClientRect()
    const elRect = options?.bound && element.getBoundingClientRect()
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

    return {
        initialLeft,
        initialTop,
        minLeft,
        maxLeft,
        minTop,
        maxTop,
        moveRatio,
    }
}

export function initMoveSvgState(
    element: SVGGraphicsElement,
    event: DragPointerEvent,
    options?: undefined | DragMoveOptions<SVGGraphicsElement>,
): DragMoveStateInit<HTMLElement, HTMLElement> {
    const svg = element.ownerSVGElement!
    const moveRatio =
        (svg.viewBox.baseVal.width || svg.clientWidth)
        /
        svg.clientWidth
    const {e: translateX, f: translateY} = element.transform.baseVal.consolidate()?.matrix ?? {}
    const initialLeft = translateX ?? 0
    const initialTop = translateY ?? 0
    const boundRect = options?.bound?.getBoundingClientRect()
    const elRect = options?.bound && element.getBoundingClientRect()
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

    return {
        initialLeft,
        initialTop,
        minLeft,
        maxLeft,
        minTop,
        maxTop,
        moveRatio,
    }
}

export function move(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragPointerEvent): undefined | DragMoveChange {
    switch (state.strategy) {
        case 'absolute':
            return moveAbsolute(state as DragMoveState<HTMLElement, HTMLElement>, event)
        case 'transform':
            return moveTransform(state as DragMoveState<HTMLElement, HTMLElement>, event)
        case 'svg':
            return moveSvg(state as DragMoveState<SVGGraphicsElement, SVGGraphicsElement>, event)
    }
}

export function moveAbsolute(state: DragMoveState<HTMLElement, HTMLElement>, event: DragPointerEvent): undefined | DragMoveChange {
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

export function moveTransform(state: DragMoveState<HTMLElement, HTMLElement>, event: DragPointerEvent): undefined | DragMoveChange {
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

export function moveSvg(state: DragMoveState<SVGGraphicsElement, SVGGraphicsElement>, event: DragPointerEvent): undefined | DragMoveChange {
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

export function computeMove(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragPointerEvent): undefined | DragMoveChange {
    const size: DragMoveChange = {
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

export function computeMoveHorizontal(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragPointerEvent): number {
    const {initialLeft, initialX, minLeft, maxLeft, moveRatio} = state
    const deltaX = (event.clientX - initialX) * moveRatio
    const nextLeft = initialLeft + deltaX

    if (isNumber(minLeft) && nextLeft < minLeft) {
        return minLeft
    }
    if (isNumber(maxLeft) && nextLeft > maxLeft) {
        return maxLeft
    }
    return nextLeft
}

export function computeMoveVertical(state: DragMoveState<DragMoveElement, DragMoveElement>, event: DragPointerEvent): number {
    const {initialTop, initialY, minTop, maxTop, moveRatio} = state
    const deltaY = (event.clientY - initialY) * moveRatio
    const nextTop = initialTop + deltaY

    if (isNumber(minTop) && nextTop < minTop) {
        return minTop
    }
    if (isNumber(maxTop) && nextTop > maxTop) {
        return maxTop
    }
    return nextTop
}

export function getComputedTransform(element: HTMLElement): Array<number> {
    const {transform} = getComputedStyle(element)

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

export function initResizeState(element: DragResizeElement, event: DragPointerEvent, options?: undefined | DragResizeOptions): DragResizeState {
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
        horizontalDirection,
        verticalDirection,
        initialX,
        initialY,
        initialWidth,
        initialHeight,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
    }
}

export function resize(state: DragResizeState, event: DragPointerEvent): undefined | DragResizeChange {
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

export function computeResize(state: DragResizeState, event: DragPointerEvent): undefined | DragResizeChange {
    const size: DragResizeChange = {
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

export function computeResizeHorizontal(state: DragResizeState, event: DragPointerEvent): number {
    const {horizontalDirection, initialWidth, initialX, minWidth, maxWidth} = state
    const deltaX = (event.clientX - initialX) * horizontalDirection
    const nextWidth = initialWidth + deltaX

    if (isNumber(minWidth) && nextWidth < minWidth) {
        return minWidth
    }
    if (isNumber(maxWidth) && nextWidth > maxWidth) {
        return maxWidth
    }
    return nextWidth
}

export function computeResizeVertical(state: DragResizeState, event: DragPointerEvent): number {
    const {verticalDirection, initialHeight, initialY, minHeight, maxHeight} = state
    const deltaY = (event.clientY - initialY) * verticalDirection
    const nextHeight = initialHeight + deltaY

    if (isNumber(minHeight) && nextHeight < minHeight) {
        return minHeight
    }
    if (isNumber(maxHeight) && nextHeight > maxHeight) {
        return maxHeight
    }
    return nextHeight
}

export function asDragPointerEvent(event: MouseEvent | TouchEvent): DragPointerEvent {
    return ('clientX' in event) && ('clientY' in event)
        ? {
            targetEvent: event,
            clientX: event.clientX,
            clientY: event.clientY,
        }
        : {
            targetEvent: event,
            clientX: event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0,
            clientY: event.touches[0]?.clientY ?? event.changedTouches[0]?.clientY ?? 0,
            // touchend event has not .touches of course. We use .changedTouches as fallback.
        }
}

// Scroll //////////////////////////////////////////////////////////////////////

export function initScrollState<E extends DragScrollElement>(
    element: E,
    event: DragPointerEvent,
    options?: undefined | DragScrollOptions,
): DragScrollState<E> {
    const horizontal = Boolean(options?.horizontal && element.scrollWidth)
    const vertical = Boolean(options?.vertical && element.scrollHeight)
    const initialX = event.clientX
    const initialY = event.clientY
    const initialScrollLeft = element.scrollLeft
    const initialScrollTop = element.scrollTop

    return {
        element,
        horizontal,
        vertical,
        initialX,
        initialY,
        initialScrollLeft,
        initialScrollTop,
    }
}

export function scroll<E extends DragScrollElement>(state: DragScrollState<E>, event: DragPointerEvent): undefined | DragScrollChange {
    const size = computeScroll(state, event)

    if (! size) {
        return
    }

    if (isNumber(size.left)) {
        state.element.scrollLeft = size.left
    }
    if (isNumber(size.top)) {
        state.element.scrollTop = size.top
    }

    return size
}

export function computeScroll<E extends DragScrollElement>(state: DragScrollState<E>, event: DragPointerEvent): undefined | DragScrollChange {
    const size: DragScrollChange = {
        left: state.horizontal
            ? computeScrollHorizontal(state, event)
            : undefined
        ,
        top: state.vertical
            ? computeScrollVertical(state, event)
            : undefined
        ,
    }
    const change = {...size}

    if (change.left === state.initialScrollLeft || change.left === undefined) {
        delete change.left
    }
    if (change.top === state.initialScrollTop || change.top === undefined) {
        delete change.top
    }

    const sizeChanged = ('left' in change) || ('top' in change)

    if (sizeChanged) {
        return change
    }

    return // Makes TypeScript happy.
}

export function computeScrollHorizontal<E extends DragScrollElement>(state: DragScrollState<E>, event: DragPointerEvent): number {
    const {initialScrollLeft, initialX} = state
    const deltaX = event.clientX - initialX
    const nextLeft = initialScrollLeft - deltaX

    return nextLeft
}

export function computeScrollVertical<E extends DragScrollElement>(state: DragScrollState<E>, event: DragPointerEvent): number {
    const {initialScrollTop, initialY} = state
    const deltaY = event.clientY - initialY
    const nextTop = initialScrollTop - deltaY

    return nextTop
}

// Types ///////////////////////////////////////////////////////////////////////

export type DragElement = HTMLElement
export type DragMoveElement = HTMLElement | SVGGraphicsElement
export type DragResizeElement = HTMLElement
export type DragScrollElement = HTMLElement

export interface DragOptions {
}

export interface DragMoveOptions<B extends DragMoveElement> extends DragOptions {
    strategy?: undefined | Exclude<DragMoveStrategy, 'svg'>
    horizontal?: undefined | boolean
    vertical?: undefined | boolean
    bound?: undefined | null | B
    minLeft?: undefined | number
    maxLeft?: undefined | number
    minTop?: undefined | number
    maxTop?: undefined | number
}

export interface DragResizeOptions extends DragOptions {
    horizontal?: undefined | 'forward' | 'backward'
    vertical?: undefined | 'forward' | 'backward'
    minWidth?: undefined | number
    maxWidth?: undefined | number
    minHeight?: undefined | number
    maxHeight?: undefined | number
}

export interface DragScrollOptions extends DragOptions {
    horizontal?: undefined | boolean
    vertical?: undefined | boolean
}

export interface DragListeners {
    onPointerMove(event: DragPointerEvent): void
    onPointerCancel(event: DragPointerEvent): void
    onPointerEnd(event: DragPointerEvent): void
}

export interface DragState<E, O extends DragOptions> {
    element: E
    options?: undefined | O
}

export interface DragMoveStateInit<E extends DragMoveElement, B extends DragMoveElement> {
    initialLeft: number
    initialTop: number
    minLeft: undefined | number
    maxLeft: undefined | number
    minTop: undefined | number
    maxTop: undefined | number
    moveRatio: number
}

export interface DragMoveState<E extends DragMoveElement, B extends DragMoveElement> extends DragState<E, DragMoveOptions<B>>, DragMoveStateInit<E, B> {
    strategy: DragMoveStrategy
    horizontal: boolean
    vertical: boolean
    initialX: number
    initialY: number
}

export interface DragResizeState extends DragState<DragResizeElement, DragResizeOptions> {
    horizontalDirection: number
    verticalDirection: number
    initialX: number
    initialY: number
    initialWidth: number
    initialHeight: number
    minWidth?: undefined | number
    maxWidth?: undefined | number
    minHeight?: undefined | number
    maxHeight?: undefined | number
}

export interface DragScrollState<E extends HTMLElement> extends DragState<E, DragScrollOptions> {
    horizontal: boolean
    vertical: boolean
    initialX: number
    initialY: number
    initialScrollLeft: number
    initialScrollTop: number
}

export interface DragMoveChange {
    left?: undefined | number
    top?: undefined | number
}

export interface DragResizeChange {
    width?: undefined | number
    height?: undefined | number
}

export interface DragScrollChange extends DragMoveChange {
}

export interface DragPointerEvent extends Pick<MouseEvent, 'clientX' | 'clientY'> {
    targetEvent: MouseEvent | TouchEvent
}

export type DragMoveStrategy = 'absolute' | 'transform' | 'svg'
