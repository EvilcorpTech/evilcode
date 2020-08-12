import {classes} from '../react'
import {createElement, useEffect, useMemo, useRef, useState} from 'react'
import {DragMoveElement} from '@eviljs/std-web/drag'
import {useMove} from '../drag'
import {useResize} from '../drag'

import './range.css'

export function ResizeStartOptions(onProgressRef: React.RefObject<Function>, onEndRef: React.RefObject<Function>) {
    return {
        horizontal: 'forward',
        style(el: HTMLElement) {
            el.classList.add('range-resize-2f8cbe', 'start')
        },
        onProgress() {
            onProgressRef.current?.()
        },
        onEnd() {
            onEndRef.current?.()
        },
    } as const
}

export function ResizeEndOptions(onProgressRef: React.RefObject<Function>, onEndRef: React.RefObject<Function>) {
    return {
        horizontal: 'backward',
        style(el: HTMLElement) {
            el.classList.add('range-resize-2f8cbe', 'end')
        },
        onProgress() {
            onProgressRef.current?.()
        },
        onEnd() {
            onEndRef.current?.()
        },
    } as const
}

export function MoveOptions(
    boundRef: React.RefObject<DragMoveElement>,
    onProgressRef: React.RefObject<Function>,
    onEndRef: React.RefObject<Function>,
) {
    return {
        //// MOVE ABSOLUTE STRATEGY
        // strategy: 'absolute',
        //// END
        vertical: false,
        boundRef,
        style(el: HTMLElement) {
            el.classList.add('range-move-550b18')
        },
        onStart(startState: {element: DragMoveElement}) {
            const el = startState.element

            //// MOVE ABSOLUTE STRATEGY
            // const left = el.offsetLeft
            // const width = el.getBoundingClientRect().width
            //
            // el.style.position = 'absolute'
            // el.style.left = left + 'px'
            // el.style.width = width + 'px'
            //// END
        },
        onProgress() {
            onProgressRef.current?.()
        },
        onEnd(progressState: {}, startState: {element: DragMoveElement}) {
            const el = startState.element

            //// MOVE TRANSFORM STRATEGY
            el.style.transform = ''
            //// END

            //// MOVE ABSOLUTE STRATEGY
            // el.style.position = ''
            // el.style.width = ''
            //// END

            onEndRef.current?.()
        },
    } as const
}

export function Range(props: RangeProps) {
    const {start, end, onChange, onChanged, ...otherProps} = props
    const [range, setRange] = useState<RangeChange>({start: 0, end: 1})
    const boundRef = useRef<HTMLDivElement>(null)
    const centerRef = useRef<HTMLDivElement>(null)
    const rangeStartRef = useRef<HTMLDivElement>(null)
    const rangeEndRef = useRef<HTMLDivElement>(null)
    const onDragProgressRef = useRef<Function | null>(null)
    const onDragEndRef = useRef<Function | null>(null)
    const moveOptions = useMemo(() => MoveOptions(boundRef, onDragProgressRef, onDragEndRef), [])
    const resizeStartOptions = useMemo(() => ResizeStartOptions(onDragProgressRef, onDragEndRef), [])
    const resizeEndOptions = useMemo(() => ResizeEndOptions(onDragProgressRef, onDragEndRef), [])
    const centerMove = useMove(centerRef, moveOptions)
    const startResize = useResize(rangeStartRef, resizeStartOptions)
    const endResize = useResize(rangeEndRef, resizeEndOptions)

    useEffect(() => {
        // centerMove.moving must not be a dependency otherwise the default
        // start and end overwrite the actual range at the end of the resize.
        if (centerMove.moving) {
            return
        }

        const nextStart = start ?? 0
        const nextEnd = end ?? 1

        if (nextStart === range.start && nextEnd === range.end) {
            return
        }

        setRange({start: nextStart, end: nextEnd})
    }, [start, end])

    useEffect(() => {
        function getRange() {
            return computeRange(
                boundRef.current!,
                centerRef.current!,
                rangeStartRef.current!,
                rangeEndRef.current!,
            )
        }

        function onDragProgress() {
            if (! onChange) {
                return
            }

            const range = getRange()

            onChange(range)
        }

        function onDragEnd() {
            const range = getRange()

            setRange(range)
            onChanged?.(range)
        }

        onDragProgressRef.current = onDragProgress
        onDragEndRef.current = onDragEnd
    }, [onChange, onChanged])

    return (
        <div
            {...otherProps}
            ref={boundRef}
            className={classes('range-3f0392', props.className, {
                moving: centerMove.moving,
                resizing: startResize.resizing || endResize.resizing,
            })}
        >
            <div
                ref={rangeStartRef}
                className="tail-2c7180 start"
                style={{width: `${range.start * 100}%`}}
            >
                <span
                    {...startResize.withResize}
                    className="handle-bd2ce4 start"
                >
                    &#124;&#124;
                </span>
            </div>

            <div
                {...centerMove.withMove}
                ref={centerRef}
                className="slider-fb2803"
            ></div>

            <div
                ref={rangeEndRef}
                className="tail-2c7180 end"
                style={{width: `${(1 - range.end) * 100}%`}}
            >
                <span
                    {...endResize.withResize}
                    className="handle-bd2ce4 end"
                >
                    &#124;&#124;
                </span>
            </div>
        </div>
    )
}

export function rangeOfTime(range: RangeChange, time: TimeRange) {
    const startTime = time.start.getTime()
    const endTime = time.end.getTime()
    const rangeStartTime = startTime + range.start * (endTime - startTime)
    const rangeEndTime = startTime + range.end * (endTime - startTime)
    const start = new Date(rangeStartTime)
    const end = new Date(rangeEndTime)

    return {start, end}
}

export function computeRange(
    bound: HTMLElement,
    center: HTMLElement,
    rangeStart: HTMLElement,
    rangeEnd: HTMLElement,
) {
    //// MOVE TRANSFORM STRATEGY
    const boundRect = bound.getBoundingClientRect()
    const centerRect = center.getBoundingClientRect()
    const total = boundRect.width
    const startOffset = centerRect.left - boundRect.left
    const endOffset = boundRect.right - centerRect.right
    //// END

    //// MOVE ABSOLUTE STRATEGY
    // const total = bound.clientWidth
    // const startOffset = center.offsetLeft
    // const endOffset = total - center.offsetWidth - center.offsetLeft
    // // const startOffset = rangeStart.clientWidth // Works with resize but not with move.
    // // const endOffset = rangeEnd.clientWidth // Works with resize but not with move.
    //// END

    const start = (1 / total) * startOffset
    const end = 1 - (1 / total) * endOffset

    return {start, end}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RangeProps {
    className?: string
    start?: number | null
    end?: number | null
    onChange?(range: RangeChange): void
    onChanged?(range: RangeChange): void
    [key: string]: unknown
}

export interface RangeChange {
    start: number
    end: number
}

export interface TimeRange {
    start: Date
    end: Date
}
