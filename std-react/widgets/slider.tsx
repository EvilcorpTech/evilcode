import {clamp} from '@eviljs/std-lib/math.js'
import {classes} from '../react.js'
import {isNil, ValueOf} from '@eviljs/std-lib/type.js'
import {Transition} from '../animation.js'
import React from 'react'
const {useCallback, useEffect, useState} = React

import './slider.css'

export const InitialIndex = 0

export const SliderDirection = {
    horizontal: 'horizontal',
    horizontalInverse: 'horizontal-inverse',
    vertical: 'vertical',
    verticalInverse: 'vertical-inverse',
} as const

export function Slider(props: SliderProps) {
    const {children, selected, direction=SliderDirection.horizontal, ...otherProps} = props
    const selectedIndex = clamp(0, selected ?? InitialIndex, children.length - 1)
    const [queue, setQueue] = useState<Array<number>>([selectedIndex])

    useEffect(() => {
        setQueue((state) =>
            [...state, selectedIndex]
        )
    }, [selectedIndex])

    const onEnd = useCallback(() => {
        setQueue((state) =>
            state.length > 0
                ? state.slice(1)
                : state
        )
    }, [])

    const towards = computeSlideDirection(selectedIndex, queue[0] ?? InitialIndex)
    const towardsClasses = {
        'backwards': towards === -1,
        'forwards': towards === 1,
    }
    const child = children[selectedIndex]

    return (
        <div
            {...otherProps}
            className={classes('slider-73e431', props.className, direction, towardsClasses)}
        >
            <Transition enter={1} exit={1} onEntered={onEnd}>
                <Slide key={selectedIndex}>
                    {child}
                </Slide>
            </Transition>
        </div>
    )
}

export function Slide(props: SlideProps) {
    const {children, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('slide-0eaba2 std-layer', props.className)}
        >
            {children}
        </div>
    )
}

export function computeSlideDirection(index?: number, prevIndex?: number) {
    if (isNil(index) || isNil(prevIndex)) {
        return 0
    }
    if (index > prevIndex) {
        return 1
    }
    if (index < prevIndex) {
        return -1
    }
    return 0
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: Array<JSX.Element>
    selected?: null | number
    direction?: ValueOf<typeof SliderDirection>
}

export interface SlideProps extends React.HTMLAttributes<HTMLDivElement> {
    children: JSX.Element
}
