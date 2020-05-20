import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

export { DragMoveChange, DragOptions } from '@eviljs/std-web/drag'

// React events handlers are slow, and React.onMouseMove leads to high cpu usage
// even when the event listener is detached, due to the Synthetic Event global
// listener always monitoring the mouse movement.

export function useDrag
    <E extends Element, C, O extends UseDragOptions<C>, S extends DragState<C>>
    (
        targetRef: DragElementRef<E>,
        hooks: UseDragHooks<C, O, S>,
        initOptions?: ReactStateInit<O>,
    )
{
    const [ dragOptions, setDragOptions ] = useState(initOptions)
    const [ dragging, setDragging ] = useState<boolean>(false)
    const dragStateRef = useRef<S | null>(null)

    const onMouseMove = useCallback((event: MouseEvent) => {
        if (! dragStateRef.current) {
            return
        }

        const dragState = dragStateRef.current
        const change = hooks.onProgress(dragState, event)

        if (change) {
            dragState.change = change
            dragOptions?.onChange?.(change)
        }
    }, [dragOptions])

    const onMouseUp = useCallback((event: MouseEvent) => {
        const change = dragStateRef.current?.change

        if (change) {
            dragOptions?.onChanged?.(change)
        }

        dragOptions?.onEnd?.()
        dragStateRef.current!.unmount()
        dragStateRef.current = null
        setDragging(false)
    }, [dragOptions])

    const onMouseLeave = useCallback((event: MouseEvent) => {
        return onMouseUp(event)
    }, [onMouseUp])

    const onMouseDown = useCallback((event: React.MouseEvent) => {
        if (! targetRef.current) {
            return
        }

        dragOptions?.onStart?.()

        const dragElement = createDragElement(dragOptions?.tag, dragOptions?.style)
        const dragListeners = {onMouseMove, onMouseUp, onMouseLeave}
        const unmountListeners = attachDragListeners(dragElement, dragListeners)
        const unmountElement = mountDragElement(dragElement, dragOptions?.region)

        function unmount() {
            // unmountListeners() // We don't need to remove the listeners.
            unmountElement()
        }

        const draggedElement = targetRef.current
        const dragState = hooks.onStart(event.nativeEvent, draggedElement, dragOptions)

        dragStateRef.current = {...dragState, unmount} as S

        setDragging(true)
    }, [onMouseMove, onMouseUp, onMouseLeave, dragOptions])

    const withDrag = useMemo(() => {
        return {onMouseDown}
    }, [onMouseDown])

    useEffect(() => {
        function unmount() {
            dragStateRef.current?.unmount()
        }

        return unmount
    }, [])

    return {dragging, withDrag, setDragOptions}
}

export function useMove(targetRef: DragElementRef<DragMoveElement>, initOptions?: ReactStateInit<UseMoveOptions>) {
    function onStart(event: MouseEvent, movedElement: DragMoveElement, options?: UseMoveOptions) {
        return initMoveState(movedElement, event, options)
    }

    function onProgress(state: UseMoveState, event: MouseEvent) {
        return move(state, event)
    }

    const dragHooks = {onStart, onProgress}
    const { dragging, setDragOptions, withDrag } = useDrag(targetRef, dragHooks, initOptions)
    const moving = dragging
    const setMoveOptions = setDragOptions
    const withMove = withDrag

    return {moving, withMove, setMoveOptions}
}

export function useResize(targetRef: DragElementRef<DragResizeElement>, initOptions?: ReactStateInit<UseResizeOptions>) {
    function onStart(event: MouseEvent, resizedElement: DragResizeElement, options?: UseResizeOptions) {
        return initResizeState(resizedElement, event, options)
    }

    function onProgress(state: UseResizeState, event: MouseEvent) {
        return resize(state, event)
    }

    const dragHooks = {onStart, onProgress}
    const { dragging, setDragOptions, withDrag } = useDrag(targetRef, dragHooks, initOptions)
    const resizing = dragging
    const setResizeOptions = setDragOptions
    const withResize = withDrag

    return {resizing, withResize, setResizeOptions}
}

// Types ///////////////////////////////////////////////////////////////////////

// Types > Drag ////////////////////////////////////////////////////////////////

export type ReactStateInit<T> = T | (() => T)
export type DragElementRef<T extends Element> = React.RefObject<T>

export interface DragState<C> {
    change?: C
    unmount(): void
}

export interface UseDragOptions<C> extends DragOptions {
    region?: Element
    tag?: DragTags
    style?: DragStyler
    onStart?(): void
    onChange?(change: C): void
    onChanged?(change: C): void
    onEnd?(): void
}

export interface UseDragHooks<C, O extends UseDragOptions<C>, S extends DragState<C>> {
    onStart(event: MouseEvent, el: Element, options?: O): Omit<S, keyof DragState<C>>
    onProgress(state: S, event: MouseEvent): C
}

// Types > Move ////////////////////////////////////////////////////////////////

export interface UseMoveState extends DragState<DragMoveChange>, DragMoveState<DragMoveElement, DragMoveElement>
{
}

export interface UseMoveOptions extends UseDragOptions<DragMoveChange>, DragMoveOptions<DragMoveElement> {
}

// Types > Resize //////////////////////////////////////////////////////////////

export interface UseResizeState extends DragState<DragResizeChange>, DragResizeState {
}

export interface UseResizeOptions extends UseDragOptions<DragResizeChange>, DragResizeOptions {
}
