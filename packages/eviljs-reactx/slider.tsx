import {clamp} from '@eviljs/std/math.js'
import {isNil, ValueOf} from '@eviljs/std/type.js'
import {classes} from '@eviljs/web/classes.js'
import {useCallback, useEffect, useState} from 'react'
import {Transition} from './transition.js'

import './slider.css'

export const InitialIndex = 0

export const SliderDirection = {
    horizontal: 'horizontal',
    horizontalInverse: 'horizontal-inverse',
    vertical: 'vertical',
    verticalInverse: 'vertical-inverse',
} as const

export function Slider(props: SliderProps) {
    const {className, children, selected, direction, ...otherProps} = props
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
    const child = children[selectedIndex]!

    return (
        <div
            {...otherProps}
            className={classes('Slider-73e4', className, direction ?? SliderDirection.horizontal, {
                backwards: towards === -1,
                forwards: towards === 1,
            })}
        >
            <Transition enter={1} exit={1} target="slide-1c54" onEntered={onEnd}>
                <Slide key={selectedIndex} className="slide-1c54">
                    {child}
                </Slide>
            </Transition>
        </div>
    )
}

export function Slide(props: SlideProps) {
    const {children, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Slide-0eab std-layer', className)}
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

export interface SlideProps extends React.HTMLAttributes<HTMLElement> {
}
