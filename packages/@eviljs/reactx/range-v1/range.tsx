import {classes} from '@eviljs/react/classes'
import type {DragPointerEvent, UseDragOptions} from '@eviljs/react/drag'
import {useDrag} from '@eviljs/react/drag'
import {clamp} from '@eviljs/std/math'
import {distanceBetween} from '@eviljs/std/scale'
import {isNone} from '@eviljs/std/type-is'
import {KeyboardKey} from '@eviljs/web/keybinding'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

export function Range(props: RangeProps): JSX.Element {
    const {
        className,
        start,
        startHandle,
        startLine,
        centerHandle,
        end,
        endHandle,
        endLine,
        onChange,
        onChanged,
        ...otherProps
    } = props
    const refs = {
        region: useRef<HTMLDivElement>(null),
        start: useRef<HTMLDivElement>(null),
        startHandle: useRef<HTMLButtonElement>(null),
        centerHandle: useRef<HTMLButtonElement>(null),
        end: useRef<HTMLDivElement>(null),
        endHandle: useRef<HTMLButtonElement>(null),
        onChange: useRef<undefined | RangeObserver>(undefined),
        onChanged: useRef<undefined | RangeObserver>(undefined),
    }
    const [dragRange, setDragRange] = useState<Range>()
    const dragStartOptions = useMemo(() => createDragOptions(refs, 'start'), [])
    const dragEndOptions = useMemo(() => createDragOptions(refs, 'end'), [])
    const dragCenterOptions = useMemo(() => createDragOptions(refs, 'center'), [])
    const startDrag = useDrag(refs.startHandle, dragStartOptions)
    const endDrag = useDrag(refs.endHandle, dragEndOptions)
    const centerDrag = useDrag(refs.centerHandle, dragCenterOptions)

    useEffect(() => {
        function onProgress(range: Range) {
            setDragRange(range)
            onChange?.(range)
        }
        function onEnd(range: Range) {
            setDragRange(undefined)
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
                className="tail-2c71 tail-2c71-start"
                style={{width: `${rangeStart * 100}%`}}
            >
                <span className="track-7bf1 track-7bf1-start">
                    {startLine}
                </span>
                <button
                    ref={refs.startHandle}
                    className="handle-bd2c handle-bd2c-start"
                    onKeyDown={event => {
                        switch (event.key) {
                            case KeyboardKey.ArrowLeft: {
                                const start = Math.max(0, rangeStart - keyboardStep)
                                const range = {start, end: rangeEnd}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                            case KeyboardKey.ArrowRight: {
                                const start = Math.min(rangeStart + keyboardStep, rangeEnd)
                                const range = {start, end: rangeEnd}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                        }
                    }}
                >
                    {startHandle || <>&#124;&#124;</>}
                </button>
            </div>

            <button
                ref={refs.centerHandle}
                className="slider-fb28"
                tabIndex={
                    distanceBetween(rangeStart, rangeEnd) > 0.1
                        ? 0
                        : -1
                }
                onKeyDown={event => {
                    switch (event.key) {
                        case KeyboardKey.ArrowLeft: {
                            const distance = distanceBetween(rangeStart, rangeEnd)
                            const start = Math.max(0, rangeStart - keyboardStep)
                            const end = Math.max(start + distance, rangeEnd - keyboardStep)
                            const range = {start, end}
                            onChange?.(range)
                            onChanged?.(range)
                        }
                        break
                        case KeyboardKey.ArrowRight: {
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
            >
                {centerHandle}
            </button>

            <div
                ref={refs.end}
                className="tail-2c71 tail-2c71-end"
                style={{width: `${(1 - rangeEnd) * 100}%`}}
            >
                <button
                    ref={refs.endHandle}
                    className="handle-bd2c handle-bd2c-end"
                    onKeyDown={event => {
                        switch (event.key) {
                            case KeyboardKey.ArrowLeft: {
                                const end = Math.max(rangeStart, rangeEnd - keyboardStep)
                                const range = {start: rangeStart, end}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                            case KeyboardKey.ArrowRight: {
                                const end = Math.min(rangeEnd + keyboardStep, 1)
                                const range = {start: rangeStart, end}
                                onChange?.(range)
                                onChanged?.(range)
                            }
                            break
                        }
                    }}
                >
                    {endHandle || <>&#124;&#124;</>}
                </button>
                <span className="track-7bf1 track-7bf1-end">
                    {endLine}
                </span>
            </div>
        </div>
    )
}

export function RangeNumeric(props: RangeNumericProps): undefined | JSX.Element {
    const {start, end, min, max, onChange, onChanged, ...otherProps} = props

    const onRangeChange = useCallback((range: Range) => {
        if (isNone(min) || isNone(max)) {
            return
        }

        const numbersRange = computeNumericRange(min, max, range)

        onChange?.(numbersRange)
    }, [onChange, min, max])

    const onRangeChanged = useCallback((range: Range) => {
        if (isNone(min) || isNone(max)) {
            return
        }

        const numbersRange = computeNumericRange(min, max, range)

        onChanged?.(numbersRange)
    }, [onChanged, min, max])

    if (isNone(min) || isNone(max) || isNone(start) || isNone(end)) {
        return
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

export function createDragOptions(refs: RangeRefs, target: RangeTarget): UseDragOptions<RangeStartState, RangeProgressState> {
    return {
        onStart(event: DragPointerEvent): RangeStartState {
            const start = refs.start.current!.getBoundingClientRect()
            const center = refs.centerHandle.current!.getBoundingClientRect()
            const end = refs.end.current!.getBoundingClientRect()
            const rects = {start, center, end}

            return [rects, event]
        },
        onProgress(event: DragPointerEvent, startState: RangeStartState): RangeProgressState {
            const [rects, startEvent] = startState
            const ratio = computeRangeRatio(rects, startEvent, event, target)

            refs.onChange.current!(ratio)

            return [...startState, event]
        },
        onEnd(event: DragPointerEvent, progressState: undefined | RangeProgressState, startState: RangeStartState) {
            if (! progressState) {
                return
            }

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
            case 'center': {
                const leftLimit = rects.start.left
                const rightLimit = rects.end.right
                const xDelta = currentEvent.clientX - initialEvent.clientX
                const nextRect = moveRectX(rects.center, xDelta, leftLimit, rightLimit)
                const startDistance = distanceBetween(rects.start.left, nextRect.left)
                const endDistance = distanceBetween(rects.start.left, nextRect.right)

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
        }
    })()
    const startRatio = startDistance / total
    const endRatio = endDistance / total

    return {start: startRatio, end: endRatio}
}

export function computeNumericRange(min: number, max: number, range: Range): Range<number> {
    const distance = distanceBetween(min, max)
    const start = min + (distance * range.start)
    const end = min + (distance * range.end)

    return {start, end}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    start: undefined | number
    startHandle?: undefined | React.ReactNode
    startLine?: undefined | React.ReactNode
    centerHandle?: undefined | React.ReactNode
    end: undefined | number
    endHandle?: undefined | React.ReactNode
    endLine?: undefined | React.ReactNode
    onChange?: undefined | RangeObserver
    onChanged?: undefined | RangeObserver
}

export interface RangeNumericProps extends RangeProps {
    min: undefined | number
    max: undefined | number
}

export type RangeStartState = [RangeRects, DragPointerEvent]
export type RangeProgressState = [...RangeStartState, DragPointerEvent]

export interface RangeRefs {
    region: React.RefObject<HTMLDivElement>
    start: React.RefObject<HTMLDivElement>
    startHandle: React.RefObject<HTMLButtonElement>
    centerHandle: React.RefObject<HTMLButtonElement>
    end: React.RefObject<HTMLDivElement>
    endHandle: React.RefObject<HTMLButtonElement>
    onChange: React.RefObject<undefined | RangeObserver>
    onChanged: React.RefObject<undefined | RangeObserver>
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
