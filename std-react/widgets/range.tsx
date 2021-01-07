import {clamp} from '@eviljs/std-lib/math.js'
import {computeDistance} from '@eviljs/std-lib/scale.js'
import {isNil} from '@eviljs/std-lib/type.js'
import {DragMoveElement, DragResizeElement} from '@eviljs/std-web/drag.js'
import React, {Fragment, useCallback} from 'react'
import {useMove, UseMoveOptions, useResize, UseResizeOptions} from '../drag.js'
import {classes} from '../react.js'
const {useEffect, useMemo, useRef, useState} = React

import './range.css'

export function Range(props: RangeProps) {
    const {start, end, onChange, onChanged, handleStart, handleEnd, ...otherProps} = props
    const [range, setRange] = useState<Range>({start: 0, end: 1})
    const boundRef = useRef<HTMLDivElement>(null)
    const centerRef = useRef<HTMLDivElement>(null)
    const rangeStartRef = useRef<HTMLDivElement>(null)
    const rangeEndRef = useRef<HTMLDivElement>(null)
    const onDragProgressRef = useRef<Function | null>(null)
    const onDragEndRef = useRef<Function | null>(null)
    const refs = {
        bound: boundRef,
        center: centerRef,
        start: rangeStartRef,
        end: rangeEndRef,
        onDragProgress: onDragProgressRef,
        onDragEnd: onDragEndRef,
    }
    const moveOptions = useMemo(() => createMoveOptions(refs), [])
    const resizeStartOptions = useMemo(() => createResizeStartOptions(refs), [])
    const resizeEndOptions = useMemo(() => createResizeEndOptions(refs), [])
    const centerMove = useMove(centerRef, moveOptions)
    const startResize = useResize(rangeStartRef, resizeStartOptions)
    const endResize = useResize(rangeEndRef, resizeEndOptions)

    useEffect(() => {
        // centerMove.moving must not be a dependency otherwise the default
        // start and end overwrite the actual range at the end of the resize.
        if (centerMove.moving || startResize.resizing || endResize.resizing) {
            return
        }

        const rangeStart = clamp(0, start ?? 0, 1)
        const rangeEnd = clamp(0, end ?? 1, 1)

        if (rangeStart === range.start && rangeEnd === range.end) {
            return
        }

        setRange({start: rangeStart, end: rangeEnd})
    }, [start, end])

    useEffect(() => {
        function getRange() {
            return computeRange(refs)
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
                    {handleStart || <Fragment>&#124;&#124;</Fragment>}
                </span>
            </div>

            <div
                {...centerMove.withMove}
                ref={centerRef}
                className="slider-fb2803"
            />

            <div
                ref={rangeEndRef}
                className="tail-2c7180 end"
                style={{width: `${(1 - range.end) * 100}%`}}
            >
                <span
                    {...endResize.withResize}
                    className="handle-bd2ce4 end"
                >
                    {handleEnd || <Fragment>&#124;&#124;</Fragment>}
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

    const rangeStart = computeDistance(min, start) / computeDistance(min, max)
    const rangeEnd = computeDistance(min, end) / computeDistance(min, max)

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
    const rangeStart = computeDistance(minTime, startTime) / computeDistance(minTime, maxTime)
    const rangeEnd = computeDistance(minTime, endTime) / computeDistance(minTime, maxTime)

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

export function createResizeStartOptions(refs: RangeRefs<DragResizeElement>): UseResizeOptions {
    return {
        horizontal: 'forward',
        onProgress() {
            refs.onDragProgress.current?.()
        },
        onEnd() {
            refs.onDragEnd.current?.()
        },
        initOptions() {
            const boundRect = refs.bound.current!.getBoundingClientRect()
            const endRect = refs.end.current!.getBoundingClientRect()
            const maxWidth = boundRect.width - endRect.width

            return {maxWidth}
        },
    }
}

export function createResizeEndOptions(refs: RangeRefs<DragResizeElement>): UseResizeOptions {
    return {
        horizontal: 'backward',
        onProgress() {
            refs.onDragProgress.current?.()
        },
        onEnd() {
            refs.onDragEnd.current?.()
        },
        initOptions() {
            const boundRect = refs.bound.current!.getBoundingClientRect()
            const startRect = refs.start.current!.getBoundingClientRect()
            const maxWidth = boundRect.width - startRect.width

            return {maxWidth}
        },
    }
}

export function createMoveOptions(refs: RangeRefs<DragMoveElement>): UseMoveOptions {
    return {
        //// MOVE ABSOLUTE STRATEGY
        //// START
        // strategy: 'absolute',
        //// END
        vertical: false,
        boundRef: refs.bound,
        onStart(startState: {element: DragMoveElement}) {
            //// MOVE ABSOLUTE STRATEGY
            //// START
            // const el = startState.element
            // const left = el.offsetLeft
            // const width = el.getBoundingClientRect().width
            //
            // el.style.position = 'absolute'
            // el.style.left = left + 'px'
            // el.style.width = width + 'px'
            //// END
        },
        onProgress() {
            refs.onDragProgress.current?.()
        },
        onEnd(progressState: {}, startState: {element: DragMoveElement}) {
            refs.onDragEnd.current?.()

            const el = startState.element
            //// MOVE TRANSFORM STRATEGY
            //// START
            el.style.transform = ''
            //// END

            //// MOVE ABSOLUTE STRATEGY
            //// START
            // el.style.position = ''
            // el.style.width = ''
            //// END
        },
    }
}

export function computeNumericRange(min: number, max: number, range: Range) {
    const distance = computeDistance(min, max)
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

export function computeRange(refs: RangeRefs<HTMLElement>) {
    //// MOVE TRANSFORM STRATEGY
    //// START
    const boundRect = refs.bound.current!.getBoundingClientRect()
    const centerRect = refs.center.current!.getBoundingClientRect()
    const total = boundRect.width
    const startOffset = centerRect.left - boundRect.left
    const endOffset = boundRect.right - centerRect.right
    //// END

    //// MOVE ABSOLUTE STRATEGY
    //// START
    // const total = refs.bound.current!.clientWidth
    // const startOffset = refs.bound.current!.offsetLeft
    // const endOffset = total - refs.bound.current!.offsetWidth - refs.bound.current!.offsetLeft
    // // const startOffset = refs.start.current!.clientWidth // Works with resize but not with move.
    // // const endOffset = refs.end.current!.clientWidth // Works with resize but not with move.
    //// END

    const start = (1 / total) * startOffset
    const end = 1 - (1 / total) * endOffset

    return {start, end}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    handleStart?: React.ReactNode
    handleEnd?: React.ReactNode
    start: undefined | null | number
    end: undefined | null | number
    onChange?(range: Range): void
    onChanged?(range: Range): void
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
    onChange?(range: RangeTime): void
    onChanged?(range: RangeTime): void
}

export interface RangeRefs<E extends Element> {
    bound: React.RefObject<E>
    center: React.RefObject<E>
    start: React.RefObject<E>
    end: React.RefObject<E>
    onDragProgress: React.RefObject<Function>
    onDragEnd: React.RefObject<Function>
}

export interface Range {
    start: number
    end: number
}

export type RangeTime = {
    [key in keyof Range]: Date
}
