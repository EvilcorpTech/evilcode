import {
    attachDragListeners,
    initMoveState,
    initResizeState,
    move,
    resize,
    DragMoveChange,
    DragMoveElement,
    DragMoveOptions,
    DragMoveState,
    DragOptions,
    DragResizeChange,
    DragResizeElement,
    DragResizeOptions,
    DragResizeState,
} from '@eviljs/std-web/drag.js'
import React from 'react'
const {useCallback, useEffect, useMemo, useRef, useState} = React

export type {DragMoveChange, DragOptions} from '@eviljs/std-web/drag.js'

// React events handlers are slow, and React.onMouseMove leads to high cpu usage
// even when the event listener is detached, due to the Synthetic Event global
// listener always monitoring the mouse movement.

export function useDrag
    <
        E extends Element,
        O extends UseDragOptions<S, P>,
        S,
        P,
    >
    (
        targetRef: DragElementRef<E>,
        options?: O,
    )
{
    const [dragging, setDragging] = useState<boolean>(false)
    const dragInfoRef = useRef<UseDragInfo<S, P>>({})

    const onPointerMove = useCallback((event: MouseEvent | TouchEvent) => {
        const dragInfo = dragInfoRef.current

        dragInfo.progressState = options?.onProgress?.(event, dragInfo.startState!)
    }, [options])

    const onPointerEnd = useCallback((event: MouseEvent | TouchEvent) => {
        const dragInfo = dragInfoRef.current

        options?.onEnd?.(dragInfo.progressState!, dragInfo.startState!)
        dragInfo.unmount?.()
        dragInfo.unmount = null
        setDragging(false)
    }, [options])

    const onPointerCancel = useCallback((event: MouseEvent | TouchEvent) => {
        return onPointerEnd(event)
    }, [onPointerEnd])

    const onPointerStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        if (! targetRef.current) {
            return
        }

        const dragListeners = {onPointerMove, onPointerEnd, onPointerCancel}
        const unmountListeners = attachDragListeners(document.body, dragListeners)
        const draggedElement = targetRef.current
        const startState = options?.onStart?.(event.nativeEvent, draggedElement)

        function unmount() {
            unmountListeners()
        }

        dragInfoRef.current.startState = startState
        dragInfoRef.current.unmount = unmount

        setDragging(true)
    }, [options, onPointerMove, onPointerEnd, onPointerCancel])

    const withDrag = useMemo(() => {
        return {onMouseDown: onPointerStart, onTouchStart: onPointerStart}
    }, [onPointerStart])

    useEffect(() => {
        // Conforms to the new React 17 behavior:
        // unmount effects must have all values in scope.
        const dragInfo = dragInfoRef.current

        function unmount() {
            dragInfo.unmount?.()
        }

        return unmount
    }, [])

    return {dragging, withDrag}
}

export function useMove(targetRef: DragElementRef<DragMoveElement>, options?: UseMoveOptions) {
    function onStart(event: MouseEvent | TouchEvent, movedElement: DragMoveElement) {
        const bound = options?.boundRef?.current
        const moveOptions = {bound, ...options, ...options?.initOptions?.()}
        const startState = initMoveState(movedElement, event, moveOptions)

        options?.onStart?.(startState)

        return startState
    }

    function onProgress(event: MouseEvent | TouchEvent, startState: DragMoveState<DragMoveElement, DragMoveElement>) {
        const progressState = move(startState, event)

        options?.onProgress?.(progressState, startState)

        return progressState
    }

    const dragOptions = useMemo(() => ({...options, onStart, onProgress}), [options])
    const {dragging, withDrag} = useDrag(targetRef, dragOptions)
    const moving = dragging
    const withMove = withDrag

    return {moving, withMove}
}

export function useResize(targetRef: DragElementRef<DragResizeElement>, options?: UseResizeOptions) {
    function onStart(event: MouseEvent | TouchEvent, resizedElement: DragResizeElement) {
        const resizeOptions = {...options, ...options?.initOptions?.()}
        const startState = initResizeState(resizedElement, event, resizeOptions)

        options?.onStart?.(startState)

        return startState
    }

    function onProgress(event: TouchEvent, startState: DragResizeState) {
        const progressState = resize(startState, event)

        options?.onProgress?.(progressState, startState)

        return progressState
    }

    const dragOptions = useMemo(() => ({...options, onStart, onProgress}), [options])
    const {dragging, withDrag} = useDrag(targetRef, dragOptions)
    const resizing = dragging
    const withResize = withDrag

    return {resizing, withResize}
}

// Types ///////////////////////////////////////////////////////////////////////

export type DragElementRef<T extends Element> = React.RefObject<T>

export interface UseDragInfo<S, P> {
    startState?: S | null
    progressState?: P
    unmount?: (() => void) | null
}

export interface UseDragConf {
    region?: Element
}

export interface UseDragOptions<S, P> extends UseDragConf, DragOptions {
    onStart?(event: MouseEvent | TouchEvent, el: Element): S
    onProgress?(event: MouseEvent | TouchEvent, state: S): P
    onEnd?(progressState: P, startState: S): void
}

export interface UseMoveOptions extends UseDragConf, DragMoveOptions<DragMoveElement> {
    boundRef?: React.RefObject<DragMoveElement>
    initOptions?(): undefined | DragMoveOptions<DragMoveElement>
    onStart?(startState: DragMoveState<DragMoveElement, DragMoveElement>): void
    onProgress?(progressState: DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>): void
    onEnd?(progressState: DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>): void
}

export interface UseResizeOptions extends UseDragConf, DragResizeOptions {
    initOptions?(): undefined | DragResizeOptions
    onStart?(startState: DragResizeState): void
    onProgress?(progressState: DragResizeChange, startState: DragResizeState): void
    onEnd?(progressState: DragResizeChange, startState: DragResizeState): void
}
