import {asArray} from '@eviljs/std/type.js'
import {classes} from '@eviljs/web/classes.js'

import './slider.css'

export enum SliderDirection {
    Row = 'row',
    RowReverse = 'row-reverse',
    Column = 'column',
    ColumnReverse = 'column-reverse',
}

export function Slider(props: SliderProps) {
    const {className, children, selected, direction, ...otherProps} = props
    const childrenList = asArray(children)

    return (
        <div
            {...otherProps}
            className={classes('Slider-73e4 std-grid-layers', className)}
        >
            {childrenList.map((it, idx) =>
                <Slide
                    key={idx}
                    className={classes('slide-1c54', {
                        previous: idx < selected,
                        selected: idx === selected,
                        following: idx > selected,
                    })}
                    style={computeSlideStyle({
                        index: idx,
                        selected,
                        direction: direction ?? SliderDirection.Row,
                    })}
                >
                    {it}
                </Slide>
            )}
        </div>
    )
}

export function Slide(props: SlideProps) {
    const {children, className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Slide-0eab', className)}
        >
            {children}
        </div>
    )
}

export function computeSlideStyle(args: {
    index: number
    selected: number
    direction: SliderDirection
}): React.CSSProperties {
    const {index, selected, direction} = args

    const [xDirection, yDirection] = (() => {
        switch (direction) {
            case SliderDirection.Column:
                return [0, 1]
            case SliderDirection.ColumnReverse:
                return [0, -1]
            case SliderDirection.Row:
                return [1, 0]
            case SliderDirection.RowReverse:
                return [-1, 0]
        }
    })()

    const distance = index - selected
    const x = `calc(${xDirection} * ${distance} * 100%)`
    const y = `calc(${yDirection} * ${distance} * 100%)`

    return {
        transform: `translate(${x}, ${y})`,
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: Array<React.ReactNode>
    selected: number
    direction?: undefined | SliderDirection
}

export interface SlideProps extends React.HTMLAttributes<HTMLElement> {
}
