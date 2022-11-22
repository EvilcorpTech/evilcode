import type {Nil} from '@eviljs/std/type.js'
import {
    attachDragListeners,
    initMoveState,
    initResizeState,
    move,
    resize,
    DragEvent,
    DragMoveChange,
    DragMoveElement,
    DragMoveOptions,
    DragMoveState,
    DragOptions,
    DragResizeChange,
    DragResizeElement,
    DragResizeOptions,
    DragResizeState,
} from '@eviljs/web/drag.js'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

export {asDragPointerEvent} from '@eviljs/web/drag.js'
export type {DragMoveChange, DragOptions, DragEvent, DragPointerEvent} from '@eviljs/web/drag.js'

// React events handlers are slow, and React.onMouseMove leads to high cpu usage
// even when the event listener is detached, due to the Synthetic Event global
// listener always monitoring the mouse movement.

export function useDrag<O extends UseDragOptions<S, P>, S, P>(options?: undefined | O) {
    const [dragging, setDragging] = useState<boolean>(false)
    const dragInfoRef = useRef<UseDragInfo<S, P>>({})

    const onPointerMove = useCallback((event: DragEvent) => {
        const dragInfo = dragInfoRef.current

        dragInfo.progressState = options?.onProgress?.(event, dragInfo.startState!)
    }, [options])

    const onPointerEnd = useCallback((event: DragEvent) => {
        const dragInfo = dragInfoRef.current

        options?.onEnd?.(dragInfo.progressState!, dragInfo.startState!)
        dragInfo.unmount?.()
        dragInfo.unmount = null
        setDragging(false)
    }, [options])

    const onPointerCancel = useCallback((event: DragEvent) => {
        return onPointerEnd(event)
    }, [onPointerEnd])

    const onPointerStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        const dragListeners = {onPointerMove, onPointerEnd, onPointerCancel}
        const unmountListeners = attachDragListeners(document.body, dragListeners)
        const startState = options?.onStart?.(event.nativeEvent)

        function onClean() {
            unmountListeners()
        }

        dragInfoRef.current.startState = startState
        dragInfoRef.current.unmount = onClean

        setDragging(true)
    }, [options, onPointerMove, onPointerEnd, onPointerCancel])

    const withDrag = useMemo(() => {
        return {onMouseDown: onPointerStart, onTouchStart: onPointerStart}
    }, [onPointerStart])

    useEffect(() => {
        // Conforms to the new React 17 behavior:
        // unmount effects must have all values in scope.
        const dragInfo = dragInfoRef.current

        function onClean() {
            dragInfo.unmount?.()
        }

        return onClean
    }, [])

    return {dragging, withDrag}
}

export function useMove(targetRef: DragElementRef<DragMoveElement>, options?: undefined | UseMoveOptions) {
    function onStart(event: DragEvent) {
        if (! targetRef.current) {
            return
        }

        const bound = options?.boundRef?.current
        const moveOptions = {bound, ...options, ...options?.initOptions?.()}
        const startState = initMoveState(targetRef.current, event, moveOptions)

        options?.onStart?.(startState)

        return startState
    }

    function onProgress(event: DragEvent, startState: DragMoveState<DragMoveElement, DragMoveElement>) {
        const progressState = move(startState, event)

        options?.onProgress?.(progressState, startState)

        return progressState
    }

    const dragOptions = useMemo(() => ({...options, onStart, onProgress}), [options])
    const {dragging, withDrag} = useDrag(dragOptions)
    const moving = dragging
    const withMove = withDrag

    return {moving, withMove}
}

export function useResize(targetRef: DragElementRef<DragResizeElement>, options?: undefined | UseResizeOptions) {
    function onStart(event: DragEvent) {
        if (! targetRef.current) {
            return
        }

        const resizeOptions = {...options, ...options?.initOptions?.()}
        const startState = initResizeState(targetRef.current, event, resizeOptions)

        options?.onStart?.(startState)

        return startState
    }

    function onProgress(event: DragEvent, startState: DragResizeState) {
        const progressState = resize(startState, event)

        options?.onProgress?.(progressState, startState)

        return progressState
    }

    const dragOptions = useMemo(() => ({...options, onStart, onProgress}), [options])
    const {dragging, withDrag} = useDrag(dragOptions)
    const resizing = dragging
    const withResize = withDrag

    return {resizing, withResize}
}

// Types ///////////////////////////////////////////////////////////////////////

export type DragElementRef<T extends Element> = React.RefObject<T>

export interface UseDragInfo<S, P> {
    startState?: Nil | S
    progressState?: undefined | P
    unmount?: Nil | (() => void)
}

export interface UseDragOptions<S, P> extends DragOptions {
    onStart?(event: DragEvent): S
    onProgress?(event: DragEvent, state: S): P
    onEnd?(progressState: P, startState: S): void
}

export interface UseMoveOptions extends DragMoveOptions<DragMoveElement> {
    boundRef?: undefined | React.RefObject<DragMoveElement>
    initOptions?(): undefined | DragMoveOptions<DragMoveElement>
    onStart?(startState: DragMoveState<DragMoveElement, DragMoveElement>): void
    onProgress?(progressState: DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>): void
    onEnd?(progressState: DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>): void
}

export interface UseResizeOptions extends DragResizeOptions {
    initOptions?(): undefined | DragResizeOptions
    onStart?(startState: DragResizeState): void
    onProgress?(progressState: DragResizeChange, startState: DragResizeState): void
    onEnd?(progressState: DragResizeChange, startState: DragResizeState): void
}
