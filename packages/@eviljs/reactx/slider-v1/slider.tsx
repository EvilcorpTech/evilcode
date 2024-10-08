import {classes} from '@eviljs/react/classes'
import {asArray} from '@eviljs/std/type-as'
import type {ValueOf} from '@eviljs/std/type'

export const SliderDirection = {
    Row: 'row' as const,
    RowReverse: 'row-reverse' as const,
    Column: 'column' as const,
    ColumnReverse: 'column-reverse' as const,
}

export function Slider(props: SliderProps): JSX.Element {
    const {className, children, selected, direction, ...otherProps} = props
    const childrenList = asArray(children)

    return (
        <div
            {...otherProps}
            className={classes('Slider-73e4 std-grid', className)}
        >
            {childrenList.map((it, idx) =>
                <Slide
                    key={idx}
                    className={classes('slide-1c54 std-grid-layer', {
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

export function Slide(props: SlideProps): JSX.Element {
    const {className, ...otherProps} = props

    return (
        <div
            {...otherProps}
            className={classes('Slide-0eab', className)}
        />
    )
}

export function computeSlideStyle(args: {
    index: number
    selected: number
    direction: SliderDirectionEnum
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
    direction?: undefined | SliderDirectionEnum
}

export interface SlideProps extends React.HTMLAttributes<HTMLElement> {
}

export type SliderDirectionEnum = ValueOf<typeof SliderDirection> & string
