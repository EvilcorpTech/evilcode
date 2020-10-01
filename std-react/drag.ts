import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
    attachDragListeners,
    createDragElement,
    initMoveState,
    initResizeState,
    mountDragElement,
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
    DragStyler,
    DragTags,
 } from '@eviljs/std-web/drag'

export type {DragMoveChange, DragOptions} from '@eviljs/std-web/drag.js'

// React events handlers are slow, and React.onMouseMove leads to high cpu usage
// even when the event listener is detached, due to the Synthetic Event global
// listener always monitoring the mouse movement.

export function useDrag
    <E extends Element, S, P, O extends UseDragOptions<S, P>>
    (targetRef: DragElementRef<E>, options?: O)
{
    const [dragging, setDragging] = useState<boolean>(false)
    const dragInfoRef = useRef<UseDragInfo<S, P>>({})

    const onMouseMove = useCallback((event: MouseEvent) => {
        const dragInfo = dragInfoRef.current

        dragInfo.progressState = options?.onProgress?.(event, dragInfo.startState!)
    }, [])

    const onMouseUp = useCallback((event: MouseEvent) => {
        const dragInfo = dragInfoRef.current

        options?.onEnd?.(dragInfo.progressState!, dragInfo.startState!)
        dragInfo.unmount?.()
        dragInfo.unmount = null
        setDragging(false)
    }, [])

    const onMouseLeave = useCallback((event: MouseEvent) => {
        return onMouseUp(event)
    }, [onMouseUp])

    const onMouseDown = useCallback((event: React.MouseEvent) => {
        if (! targetRef.current) {
            return
        }

        const dragElement = createDragElement(options?.tag, options?.style)
        const dragListeners = {onMouseMove, onMouseUp, onMouseLeave}
        const unmountListeners = attachDragListeners(dragElement, dragListeners)
        const unmountElement = mountDragElement(dragElement, options?.region)

        function unmount() {
            // unmountListeners() // We don't need to remove the listeners.
            unmountElement()
        }

        const draggedElement = targetRef.current
        const startState = options?.onStart?.(event.nativeEvent, draggedElement)

        dragInfoRef.current.startState = startState
        dragInfoRef.current.unmount = unmount

        setDragging(true)
    }, [onMouseMove, onMouseUp, onMouseLeave, options])

    const withDrag = useMemo(() => {
        return {onMouseDown}
    }, [onMouseDown])

    useEffect(() => {
        const dragInfo = dragInfoRef.current // Conforms to the new React 17 behavior.

        function unmount() {
            dragInfo.unmount?.()
        }

        return unmount
    }, [])

    return {dragging, withDrag}
}

export function useMove(targetRef: DragElementRef<DragMoveElement>, options?: UseMoveOptions) {
    function onStart(event: MouseEvent, movedElement: DragMoveElement) {
        const bound = options?.boundRef?.current
        const moveOptions = {bound, ...options}
        const startState = initMoveState(movedElement, event, moveOptions)

        options?.onStart?.(startState)

        return startState
    }

    function onProgress(event: MouseEvent, startState: DragMoveState<DragMoveElement, DragMoveElement>) {
        const progressState = move(startState, event)

        options?.onProgress?.(progressState, startState)

        return progressState
    }

    const dragOptions = {...options, onStart, onProgress}
    const {dragging, withDrag} = useDrag(targetRef, dragOptions)
    const moving = dragging
    const withMove = withDrag

    return {moving, withMove}
}

export function useResize(targetRef: DragElementRef<DragResizeElement>, options?: UseResizeOptions) {
    function onStart(event: MouseEvent, resizedElement: DragResizeElement) {
        const startState = initResizeState(resizedElement, event, options)

        options?.onStart?.(startState)

        return startState
    }

    function onProgress(event: MouseEvent, startState: DragResizeState) {
        const progressState = resize(startState, event)

        options?.onProgress?.(progressState, startState)

        return progressState
    }

    const dragOptions = {...options, onStart, onProgress}
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
    tag?: DragTags
    style?: DragStyler
}

export interface UseDragOptions<S, P> extends UseDragConf, DragOptions {
    onStart?(event: MouseEvent, el: Element): S
    onProgress?(event: MouseEvent, state: S): P
    onEnd?(progressState: P, startState: S): void
}

export interface UseMoveOptions extends UseDragConf, DragMoveOptions<DragMoveElement> {
    boundRef?: React.RefObject<DragMoveElement>
    onStart?(startState: DragMoveState<DragMoveElement, DragMoveElement>): void
    onProgress?(progressState: DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>): void
    onEnd?(progressState: DragMoveChange, startState: DragMoveState<DragMoveElement, DragMoveElement>): void
}

export interface UseResizeOptions extends UseDragConf, DragResizeOptions {
    onStart?(startState: DragResizeState): void
    onProgress?(progressState: DragResizeChange, startState: DragResizeState): void
    onEnd?(progressState: DragResizeChange, startState: DragResizeState): void
}
