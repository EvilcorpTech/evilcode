import {
    asDragPointerEvent,
    attachDragListeners,
    initMoveState,
    initResizeState,
    initScrollState,
    move,
    resize,
    scroll,
    type DragMoveChange,
    type DragMoveElement,
    type DragMoveOptions,
    type DragMoveState,
    type DragOptions,
    type DragPointerEvent,
    type DragResizeChange,
    type DragResizeElement,
    type DragResizeOptions,
    type DragResizeState,
    type DragScrollChange,
    type DragScrollOptions,
    type DragScrollState,
} from '@eviljs/web/drag.js'
import {useCallback, useEffect, useRef, useState} from 'react'

export {asDragPointerEvent} from '@eviljs/web/drag.js'
export type {DragMoveChange, DragOptions, DragPointerEvent} from '@eviljs/web/drag.js'

// React events handlers are slow, and React.onMouseMove leads to high cpu usage
// even when the event listener is detached, due to the Synthetic Event global
// listener always monitoring the mouse movement.

export function useDrag<S, P>(targetRef: DragElementRef<DragMoveElement>, options?: undefined | UseDragOptions<S, P>) {
    const [dragging, setDragging] = useState<boolean>(false)
    const stateRef = useRef<UseDragState<S, P>>({})

    const onPointerMove = useCallback((event: DragPointerEvent) => {
        const state = stateRef.current

        setDragging(true)

        if (state.startState) {
            state.progressState = options?.onProgress?.(event, state.startState)
        }
    }, [options?.onProgress])

    const onPointerEnd = useCallback((event: DragPointerEvent) => {
        const state = stateRef.current

        setDragging(false)

        if (state.startState) {
            options?.onEnd?.(event, state.progressState, state.startState)
        }

        state.unmount?.()
        state.unmount = undefined
    }, [options?.onEnd])

    const onPointerCancel = useCallback((event: DragPointerEvent) => {
        return onPointerEnd(event)
    }, [onPointerEnd])

    const onPointerStart = useCallback((event: MouseEvent | TouchEvent) => {
        if (event.type === 'mousedown' && event.cancelable) {
            // Prevents dragging of draggable elements like images.
            event.preventDefault()
        }

        const removeListeners = attachDragListeners(document.documentElement, {
            onPointerMove,
            onPointerEnd,
            onPointerCancel,
        })

        const startState = options?.onStart?.(asDragPointerEvent(event))

        function onClean() {
            removeListeners()
        }

        stateRef.current.startState = startState
        stateRef.current.progressState = undefined
        stateRef.current.unmount = onClean
    }, [onPointerMove, onPointerEnd, onPointerCancel, options?.onStart])

    useEffect(() => {
        if (! targetRef.current) {
            return
        }

        const target = targetRef.current as HTMLElement

        function preventDefaultAction(event: Event) {
            if (! stateRef.current.progressState) {
                // No dragging happened. We should not prevent the default action.
                return
            }
            // some dragging happened. We should prevent the default action.
            event.preventDefault()
        }

        target.addEventListener('click', preventDefaultAction, {capture: true, passive: false}) // Prevents activating actionable elements like links.
        target.addEventListener('mousedown', onPointerStart, {capture: true, passive: false})
        target.addEventListener('touchstart', onPointerStart, {capture: true, passive: true})

        function onClean() {
            target.removeEventListener('click', preventDefaultAction, true)
            target.removeEventListener('mousedown', onPointerStart, true)
            target.removeEventListener('touchstart', onPointerStart, true)
        }

        return onClean
    }, [onPointerStart])

    useEffect(() => {
        // Conforms to the new React 17 behavior:
        // clean effects must have all values in scope.
        const state = stateRef.current

        function onClean() {
            state.unmount?.()
        }

        return onClean
    }, [])

    return {dragging}
}

export function useMove(targetRef: DragElementRef<DragMoveElement>, options?: undefined | UseMoveOptions) {
    const onStart = useCallback((event: DragPointerEvent) => {
        if (! targetRef.current) {
            return
        }

        const bound = options?.boundRef?.current
        const moveOptions = {bound, ...options, ...options?.initOptions?.()}
        const startState = initMoveState(targetRef.current, event, moveOptions)

        options?.onStart?.(event, startState)

        return startState
    }, [options?.initOptions, options?.onStart])

    const onProgress = useCallback((event: DragPointerEvent, startState: DragMoveState<DragMoveElement, DragMoveElement>) => {
        const progressState = move(startState, event)

        if (progressState) {
            options?.onProgress?.(event, progressState, startState)
        }

        return progressState
    }, [options?.onProgress])

    const onEnd = useCallback((event: DragPointerEvent, progressState: undefined | DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>) => {
        if (progressState) {
            options?.onEnd?.(event, progressState, startState)
        }

    }, [options?.onEnd])

    const {dragging} = useDrag(targetRef, {onStart, onProgress, onEnd})

    return {moving: dragging}
}

export function useResize(targetRef: DragElementRef<DragResizeElement>, options?: undefined | UseResizeOptions) {
    const onStart = useCallback((event: DragPointerEvent) => {
        if (! targetRef.current) {
            return
        }

        const resizeOptions = {...options, ...options?.initOptions?.()}
        const startState = initResizeState(targetRef.current, event, resizeOptions)

        options?.onStart?.(event, startState)

        return startState
    }, [options?.initOptions, options?.onStart])

    const onProgress = useCallback((event: DragPointerEvent, startState: DragResizeState) => {
        const progressState = resize(startState, event)

        if (progressState) {
            options?.onProgress?.(event, progressState, startState)
        }

        return progressState
    }, [options?.onProgress])

    const onEnd = useCallback((event: DragPointerEvent, progressState: undefined | DragResizeChange, startState: DragResizeState) => {
        if (progressState) {
            options?.onEnd?.(event, progressState, startState)
        }
    }, [options?.onEnd])

    const {dragging} = useDrag(targetRef, {onStart, onProgress, onEnd})

    return {resizing: dragging}
}

export function useScrollHorizontal<E extends HTMLElement>(targetRef: React.RefObject<E>, options?: undefined | UseScrollOptions<E>) {
    const onStart = useCallback((event: DragPointerEvent) => {
        if (! targetRef.current) {
            return
        }

        const scrollOptions = {...options, ...options?.initOptions?.()}
        const startState = initScrollState(targetRef.current, event, scrollOptions)

        options?.onStart?.(event, startState)

        return startState
    }, [options?.initOptions, options?.onStart])

    const onProgress = useCallback((event: DragPointerEvent, startState: DragScrollState<E>) => {
        const progressState = scroll(startState, event)

        if (progressState) {
            options?.onProgress?.(event, progressState, startState)
        }

        return progressState
    }, [options?.onProgress])

    const onEnd = useCallback((event: DragPointerEvent, progressState: undefined | DragScrollChange, startState: DragScrollState<E>) => {
        options?.onEnd?.(event, progressState, startState)
    }, [options?.onEnd])

    const {dragging} = useDrag(targetRef, {onStart, onProgress, onEnd})

    return {scrolling: dragging}
}

// Types ///////////////////////////////////////////////////////////////////////

export type DragElementRef<T extends Element> = React.RefObject<T>

export interface UseDragState<S, P> {
    startState?: undefined | S
    progressState?: undefined | P
    unmount?: undefined | (() => void)
}

export interface UseDragOptions<S, P> extends DragOptions {
    onStart?: undefined | ((event: DragPointerEvent) => undefined | S)
    onProgress?: undefined | ((event: DragPointerEvent, startState: S) => undefined | P)
    onEnd?: undefined | ((event: DragPointerEvent, progressState: undefined | P, startState: S) => void)
}

export interface UseMoveOptions extends DragMoveOptions<DragMoveElement> {
    boundRef?: undefined | React.RefObject<DragMoveElement>
    initOptions?: undefined | (() => undefined | DragMoveOptions<DragMoveElement>)
    onStart?: undefined | ((event: DragPointerEvent, startState: DragMoveState<DragMoveElement, DragMoveElement>) => void)
    onProgress?: undefined | ((event: DragPointerEvent, progressState: DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>) => void)
    onEnd?: undefined | ((event: DragPointerEvent, progressState: undefined | DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>) => void)
}

export interface UseResizeOptions extends DragResizeOptions {
    initOptions?: undefined | (() => undefined | DragResizeOptions)
    onStart?: undefined | ((event: DragPointerEvent, startState: DragResizeState) => void)
    onProgress?: undefined | ((event: DragPointerEvent, progressState: DragResizeChange, startState: DragResizeState) => void)
    onEnd?: undefined | ((event: DragPointerEvent, progressState: undefined | DragResizeChange, startState: DragResizeState) => void)
}

export interface UseScrollOptions<E extends HTMLElement> extends DragScrollOptions {
    initOptions?: undefined | (() => undefined | DragScrollOptions)
    onStart?: undefined | ((event: DragPointerEvent, startState: DragScrollState<E>) => void)
    onProgress?: undefined | ((event: DragPointerEvent, progressState: DragScrollChange, startState: DragScrollState<E>) => void)
    onEnd?: undefined | ((event: DragPointerEvent, progressState: undefined | DragScrollChange, startState: DragScrollState<E>) => void)
}
