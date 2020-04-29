import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    attachResizeListeners,
    createResizeElement,
    mountResizeElement,
    readElementSize,
    resize,
    ResizeInitialState,
    ResizeOptions,
    ResizeStyler,
    ResizeTags,
 } from '@eviljs/std-web/resize'

// React events handlers are slow, and React.onMouseMove leads to high cpu usage
// even when the event listener is detached, due to the Syntenthic Event global
// listener always monitoring the mouse movement.

export function useResize(triggerRef: ResizeElementRef, initOptions?: UseResizeOptions | UseResizeOptionsInit) {
    const [ options, setResizeOptions ] = useState(initOptions)
    const [ resizing, setResizing ] = useState<boolean>(false)
    const stateRef = useRef<ResizeState | null>(null)

    const onMouseDown = useCallback((event: React.MouseEvent) => {
        if (! triggerRef.current) {
            return
        }

        function onMouseMove(event: MouseEvent) {
            if (! triggerRef.current) {
                return
            }

            if (! stateRef.current) {
                return
            }

            const el = triggerRef.current
            const state = stateRef.current
            const sizeChange = resize(el, state, event, options)

            if (sizeChange) {
                state.sizeChange = sizeChange
                options?.onChange?.(sizeChange)
            }
        }

        function onMouseUp(event: MouseEvent) {
            const sizeChange = stateRef.current?.sizeChange

            if (sizeChange) {
                options?.onChanged?.(sizeChange)
            }

            stateRef.current = null
            unmount()
            setResizing(false)
        }

        function onMouseLeave(event: MouseEvent) {
            return onMouseUp(event)
        }

        const delegate = createResizeElement(options?.tag, options?.style)
        /* const unmountListeners =*/ attachResizeListeners(delegate, {
            onMouseMove, onMouseUp, onMouseLeave,
        })
        const unmountElement = mountResizeElement(delegate, options?.region)

        function unmount() {
            // We don't need to remove the listeners.
            unmountElement()
        }

        const { width, height } = readElementSize(triggerRef.current)
        const state = {
            initialWidth: width,
            initialHeight: height,
            initialX: event.clientX,
            initialY: event.clientY,
            unmount,
        }

        stateRef.current = state

        setResizing(true)
    }, [options])

    const withResize = useMemo(() => {
        return {onMouseDown}
    }, [onMouseDown])

    useEffect(() => {
        function unmount() {
            stateRef.current?.unmount()
        }

        return unmount
    }, [])

    return {resizing, withResize, setResizeOptions}
}

// Types ///////////////////////////////////////////////////////////////////////

export type ResizeElementRef = React.RefObject<HTMLElement>

export interface UseResizeOptions extends ResizeOptions {
    region?: Element
    tag?: ResizeTags
    style?: ResizeStyler
    onChange?(size: ResizeSize): void
    onChanged?(size: ResizeSize): void
}

export interface UseResizeOptionsInit {
    (): UseResizeOptions
}

export interface ResizeState extends ResizeInitialState {
    sizeChange?: ResizeSize
    unmount(): void
}

export interface ResizeSize {
    width: number
    height: number
}
