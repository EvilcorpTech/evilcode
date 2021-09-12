import {clamp} from '@eviljs/std/math.js'
import {distanceBetween} from '@eviljs/std/scale.js'
import {isNil} from '@eviljs/std/type.js'
import {useDrag, asDragPointerEvent, DragEvent, DragPointerEvent} from '@eviljs/react/drag.js'
import {classes} from '@eviljs/react/react.js'
import {useCallback, useEffect, useMemo, useRef, useState, Fragment} from 'react'

import './index.css'

export function Range(props: RangeProps) {
    const {
        className,
        start,
        end,
        startHandle,
        startLine,
        endHandle,
        endLine,
        onChange,
        onChanged,
        ...otherProps
    } = props
    const refs = {
        region: useRef<HTMLDivElement>(null),
        start: useRef<HTMLDivElement>(null),
        end: useRef<HTMLDivElement>(null),
        center: useRef<HTMLButtonElement>(null),
        onChange: useRef<null | RangeObserver>(null),
        onChanged: useRef<null | RangeObserver>(null),
    }
    const [dragRange, setDragRange] = useState<null | Range>(null)
    const dragStartOptions = useMemo(() => createDragOptions(refs, 'start'), [])
    const dragEndOptions = useMemo(() => createDragOptions(refs, 'end'), [])
    const dragCenterOptions = useMemo(() => createDragOptions(refs, 'center'), [])
    const startDrag = useDrag(dragStartOptions)
    const endDrag = useDrag(dragEndOptions)
    const centerDrag = useDrag(dragCenterOptions)

    useEffect(() => {
        function onProgress(range: Range) {
            setDragRange(range)
            onChange?.(range)
        }
        function onEnd(range: Range) {
            setDragRange(null)
            onChanged?.(range)
        }

        refs.onChange.current = onProgress
        refs.onChanged.current = onEnd
    }, [onChange, onChanged])

    const startClamped = clamp(0, start ?? 0, 1)
    const endClamped = clamp(0, end ?? 1, 1)
    // We use the dragRange to immediately reflect the change in case there isn't
    // the onChange callback.
    const rangeStart = dragRange?.start ?? startClamped
    const rangeEnd = dragRange?.end ?? endClamped
    const isResizing = startDrag.dragging || endDrag.dragging
    const isSliding = centerDrag.dragging
    const isMoving = isResizing || isSliding
    const keyboardStep = .05

    return (
        <div
            {...otherProps}
            ref={refs.region}
            className={classes('Range-3f03', className, {
                resizing: isResizing,
                sliding: isSliding,
                moving: isMoving,
            })}
        >
            <div
                ref={refs.start}
                className="tail-2c71 start"
                style={{width: `${rangeStart * 100}%`}}
            >
                <span className="track-7bf1 start">
                    {startLine}
                </span>
                <button
                    {...startDrag.withDrag}
                    className="handle-bd2c start"
                    onKeyDown={(event) => {
                        switch (event.key) {
                            case 'ArrowLeft': {
                                const start = Math.max(0, rangeStart - keyboardStep)
                                const range = {start, end: rangeEnd}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                            case 'ArrowRight': {
                                const start = Math.min(rangeStart + keyboardStep, rangeEnd)
                                const range = {start, end: rangeEnd}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                        }
                    }}
                >
                    {startHandle || <Fragment>&#124;&#124;</Fragment>}
                </button>
            </div>

            <button
                {...centerDrag.withDrag}
                ref={refs.center}
                className="slider-fb28"
                tabIndex={distanceBetween(rangeStart, rangeEnd) > 0.1
                    ? 0
                    : -1
                }
                onKeyDown={(event) => {
                    switch (event.key) {
                        case 'ArrowLeft': {
                            const distance = distanceBetween(rangeStart, rangeEnd)
                            const start = Math.max(0, rangeStart - keyboardStep)
                            const end = Math.max(start + distance, rangeEnd - keyboardStep)
                            const range = {start, end}
                            onChange?.(range)
                            onChanged?.(range)
                        }
                        break
                        case 'ArrowRight': {
                            const distance = distanceBetween(rangeStart, rangeEnd)
                            const end = Math.min(rangeEnd + keyboardStep, 1)
                            const start = Math.min(rangeStart + keyboardStep, end - distance)
                            const range = {start, end}
                            onChange?.(range)
                            onChanged?.(range)
                        }
                        break
                    }
                }}
            />

            <div
                ref={refs.end}
                className="tail-2c71 end"
                style={{width: `${(1 - rangeEnd) * 100}%`}}
            >
                <button
                    {...endDrag.withDrag}
                    className="handle-bd2c end"
                    onKeyDown={(event) => {
                        switch (event.key) {
                            case 'ArrowLeft': {
                                const end = Math.max(rangeStart, rangeEnd - keyboardStep)
                                const range = {start: rangeStart, end}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                            case 'ArrowRight': {
                                const end = Math.min(rangeEnd + keyboardStep, 1)
                                const range = {start: rangeStart, end}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                        }
                    }}
                >
                    {endHandle || <Fragment>&#124;&#124;</Fragment>}
                </button>
                <span className="track-7bf1 end">
                    {endLine}
                </span>
            </div>
        </div>
    )
}

export function RangeNumeric(props: RangeNumericProps) {
    const {start, end, min, max, onChange, onChanged, ...otherProps} = props

    const onRangeChange = useCallback((range: Range) => {
        if (isNil(min) || isNil(max)) {
            return
        }

        const numbersRange = computeNumericRange(min, max, range)

        onChange?.(numbersRange)
    }, [onChange, min, max])

    const onRangeChanged = useCallback((range: Range) => {
        if (isNil(min) || isNil(max)) {
            return
        }

        const numbersRange = computeNumericRange(min, max, range)

        onChanged?.(numbersRange)
    }, [onChanged, min, max])

    if (isNil(min) || isNil(max) || isNil(start) || isNil(end)) {
        return null
    }

    const startClamped = Math.max(start, min)
    const endClamped = Math.min(end, max)
    const rangeStart = distanceBetween(min, startClamped) / distanceBetween(min, max)
    const rangeEnd = distanceBetween(min, endClamped) / distanceBetween(min, max)

    return (
        <Range
            {...otherProps}
            start={rangeStart}
            end={rangeEnd}
            onChange={onRangeChange}
            onChanged={onRangeChanged}
        />
    )
}

export function RangeTime(props: RangeTimeProps) {
    const {start, end, min, max, onChange, onChanged, ...otherProps} = props

    const onRangeChange = useCallback((range: Range) => {
        if (isNil(min) || isNil(max)) {
            return
        }

        const datesRange = computeTimeRange(min, max, range)

        onChange?.(datesRange)
    }, [onChange, min, max])

    const onRangeChanged = useCallback((range: Range) => {
        if (isNil(min) || isNil(max)) {
            return
        }

        const datesRange = computeTimeRange(min, max, range)

        onChanged?.(datesRange)
    }, [onChanged, min, max])


    if (isNil(min) || isNil(max) || isNil(start) || isNil(end)) {
        return null
    }

    const minTime = min.getTime()
    const maxTime = max.getTime()
    const startTime = start.getTime()
    const endTime = end.getTime()
    const startTimeClamped = Math.max(startTime, minTime)
    const endTimeClamped = Math.min(endTime, maxTime)
    const rangeStart = distanceBetween(minTime, startTimeClamped) / distanceBetween(minTime, maxTime)
    const rangeEnd = distanceBetween(minTime, endTimeClamped) / distanceBetween(minTime, maxTime)

    return (
        <Range
            {...otherProps}
            start={rangeStart}
            end={rangeEnd}
            onChange={onRangeChange}
            onChanged={onRangeChanged}
        />
    )
}

export function createDragOptions(refs: RangeRefs, target: RangeTarget) {
    type StartState = [RangeRects, DragPointerEvent]
    type ProgressState = [...StartState, DragPointerEvent]

    return {
        onStart(dragEvent: DragEvent): StartState {
            const event = asDragPointerEvent(dragEvent)
            const start = refs.start.current!.getBoundingClientRect()
            const center = refs.center.current!.getBoundingClientRect()
            const end = refs.end.current!.getBoundingClientRect()
            const rects = {start, center, end}

            return [rects, event]
        },
        onProgress(dragEvent: DragEvent, startState: StartState): ProgressState {
            const event = asDragPointerEvent(dragEvent)
            const [rects, startEvent] = startState
            const ratio = computeRangeRatio(rects, startEvent, event, target)

            refs.onChange.current!(ratio)

            return [...startState, event]
        },
        onEnd(progressState: ProgressState, startState: StartState) {
            const [rects, startEvent, progressEvent] = progressState
            const ratio = computeRangeRatio(rects, startEvent, progressEvent, target)

            refs.onChanged.current!(ratio)
        },
    }
}

export function computeRangeRatio(
    rects: RangeRects,
    initialEvent: DragPointerEvent,
    currentEvent: DragPointerEvent,
    target: RangeTarget,
): Range
{
    const total = rects.start.width + rects.center.width + rects.end.width
    const xDelta = currentEvent.clientX - initialEvent.clientX

    function moveRectX(rect: DOMRect, delta: number, leftLimit: number, rightLimit: number): DOMRect {
        const x = clamp(
            leftLimit,
            rect.left + delta,
            Math.max(rightLimit - rect.width, leftLimit), // Just in case the rect is bigger than the limits.
        )
        const left = x
        const right = left + rect.width

        return {...rect, x, left, right}
    }

    const {startDistance, endDistance} = (() => {
        switch (target) {
            case 'start': {
                const leftLimit = rects.start.left - rects.start.width
                const rightLimit = rects.end.left
                const nextRect = moveRectX(rects.start, xDelta, leftLimit, rightLimit)
                const startDistance = distanceBetween(rects.start.left, nextRect.right)
                const endDistance = distanceBetween(rects.start.left, rects.end.left)

                return {startDistance, endDistance}
            }
            case 'end': {
                const leftLimit = rects.start.right
                const rightLimit = rects.end.right + rects.end.width
                const nextRect = moveRectX(rects.end, xDelta, leftLimit, rightLimit)
                const startDistance = distanceBetween(rects.start.left, rects.start.right)
                const endDistance = distanceBetween(rects.start.left, nextRect.left)

                return {startDistance, endDistance}
            }
            case 'center': {
                const leftLimit = rects.start.left
                const rightLimit = rects.end.right
                const xDelta = currentEvent.clientX - initialEvent.clientX
                const nextRect = moveRectX(rects.center, xDelta, leftLimit, rightLimit)
                const startDistance = distanceBetween(rects.start.left, nextRect.left)
                const endDistance = distanceBetween(rects.start.left, nextRect.right)

                return {startDistance, endDistance}
            }
        }
    })()
    const startRatio = startDistance / total
    const endRatio = endDistance / total

    return {start: startRatio, end: endRatio}
}

export function computeNumericRange(min: number, max: number, range: Range) {
    const distance = distanceBetween(min, max)
    const start = min + (distance * range.start)
    const end = min + (distance * range.end)

    return {start, end}
}

export function computeTimeRange(min: Date, max: Date, range: Range) {
    const numbersRange = computeNumericRange(min.getTime(), max.getTime(), range)
    const start = new Date(numbersRange.start)
    const end = new Date(numbersRange.end)

    return {start, end}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    start: undefined | null | number
    end: undefined | null | number
    startHandle?: React.ReactNode
    startLine?: React.ReactNode
    endHandle?: React.ReactNode
    endLine?: React.ReactNode
    onChange?: RangeObserver
    onChanged?: RangeObserver
}

export interface RangeNumericProps extends RangeProps {
    min: undefined | null | number
    max: undefined | null | number
}

export interface RangeTimeProps extends Omit<RangeProps, 'start' | 'end' | 'onChange' | 'onChanged'> {
    start: undefined | null | Date
    end: undefined | null | Date
    min: undefined | null | Date
    max: undefined | null | Date
    onChange?: RangeObserver<Date>
    onChanged?: RangeObserver<Date>
}

export interface RangeRefs {
    region: React.RefObject<HTMLDivElement>
    start: React.RefObject<HTMLDivElement>
    end: React.RefObject<HTMLDivElement>
    center: React.RefObject<HTMLButtonElement>
    onChange: React.RefObject<RangeObserver>
    onChanged: React.RefObject<RangeObserver>
}

export interface RangeRects {
    start: DOMRect
    center: DOMRect
    end: DOMRect
}

export type RangeTarget = 'start' | 'center' | 'end'

export interface RangeObserver<T = number> {
    (change: Range<T>): void
}

export interface Range<T = number> {
    start: T
    end: T
}
