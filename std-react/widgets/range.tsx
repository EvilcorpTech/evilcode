import { className } from '../react'
import { createElement, useCallback, useEffect, useRef, useState } from 'react'
import { useMove } from '../drag'
import { useResize } from '../drag'

import './range.css'

export function Range(props: RangeProps) {
    const { boundRef, start, end, onChange, onChanged, ...otherProps } = props
    const [ range, setRange ] = useState<RangeChange>({start: 0, end: 1})
    const centerRef = useRef<HTMLDivElement>(null)
    const rangeStartRef = useRef<HTMLDivElement>(null)
    const rangeEndRef = useRef<HTMLDivElement>(null)
    const centerMove = useMove(centerRef)
    const startResize = useResize(rangeStartRef)
    const endResize = useResize(rangeEndRef)

    useEffect(() => {
        // centerMove.moving must not be a dependency otherwise the default
        // start and end overwrites the actual range at the end of the resize.
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

    const onRangeChange = useCallback(() => {
        if (! onChange) {
            return
        }

        const range = computeRange(
            boundRef.current!,
            centerRef.current!,
            rangeStartRef.current!,
            rangeEndRef.current!,
        )

        onChange(range)
    }, [onChange])

    const onRangeChanged = useCallback(() => {
        const range = computeRange(
            boundRef.current!,
            centerRef.current!,
            rangeStartRef.current!,
            rangeEndRef.current!,
        )

        setRange(range)
        onChanged?.(range)
    }, [onChanged])

    useEffect(() => {
        startResize.setResizeOptions(options => ({
            ...options,
            horizontal: 'forward',
            style(el: HTMLElement) {
                el.classList.add('range-resize-2f8cbe', 'start')
            },
            onChange: onRangeChange,
            onChanged: onRangeChanged,
        }))
        endResize.setResizeOptions(options => ({
            ...options,
            horizontal: 'backward',
            style(el: HTMLElement) {
                el.classList.add('range-resize-2f8cbe', 'end')
            },
            onChange: onRangeChange,
            onChanged: onRangeChanged,
        }))
    }, [onRangeChange, onRangeChanged])

    useEffect(() => {
        centerMove.setMoveOptions(options => ({
            ...options,
            // strategy: 'absolute', // MOVE ABSOLUTE STRATEGY
            vertical: false,
            bound: boundRef.current!,
            style(el: HTMLElement) {
                el.classList.add('range-move-550b18')
            },
            onStart() {
                const el = centerRef.current

                if (! el) {
                    return
                }

                //// MOVE ABSOLUTE STRATEGY
                // const left = el.offsetLeft
                // const width = el.getBoundingClientRect().width
                //
                // el.style.position = 'absolute'
                // el.style.left = left + 'px'
                // el.style.width = width + 'px'
            },
            onEnd() {
                const el = centerRef.current

                if (! el) {
                    return
                }

                //// MOVE TRANSFORM STRATEGY
                el.style.transform = ''

                //// MOVE ABSOLUTE STRATEGY
                // el.style.position = ''
                // el.style.width = ''
            },
            onChange: onRangeChange,
            onChanged: onRangeChanged,
        }))
    }, [onRangeChange, onRangeChanged])

    return (
        <div
            {...otherProps}
            {...className('range-3f0392', props.className, {
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

    //// MOVE ABSOLUTE STRATEGY
    // const total = bound.clientWidth
    // const startOffset = center.offsetLeft
    // const endOffset = total - center.offsetWidth - center.offsetLeft
    // // const startOffset = rangeStart.clientWidth // Works with resize but not with move.
    // // const endOffset = rangeEnd.clientWidth // Works with resize but not with move.

    const start = (1 / total) * startOffset
    const end = 1 - (1 / total) * endOffset

    return {start, end}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RangeProps {
    className?: string
    boundRef: React.RefObject<HTMLElement>
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
