import {Box, type BoxProps} from '@eviljs/react/box'
import {useBrowserFeatures} from '@eviljs/react/browser'
import {classes} from '@eviljs/react/classes'
import {displayName} from '@eviljs/react/display-name'
import {useScrollHorizontal} from '@eviljs/react/drag'
import {mergingRefs} from '@eviljs/react/ref'
import {isUndefined} from '@eviljs/std/type-is'
import {forwardRef, useMemo, useRef} from 'react'

export const Scrollable: React.ComponentType<ScrollableProps> = displayName('Scrollable', forwardRef(function Scrollable(
    props: ScrollableProps,
    ref: React.ForwardedRef<HTMLElement>
) {
    const {
        className,
        horizontal: horizontalOptional,
        vertical: verticalOptional,
        scrollingStyle,
        style,
        ...otherProps
    } = props
    const elementRef = useRef<HTMLElement>(null)
    const scrollBoth = isUndefined(horizontalOptional) && isUndefined(verticalOptional)
    const horizontal = horizontalOptional || scrollBoth
    const vertical = verticalOptional || scrollBoth
    const browserFeatures = useBrowserFeatures()
    const hasTouch = browserFeatures.touch

    const initOptions = useMemo(() => {
        // Forces updating the drag listeners when the browser capabilities change.
        return () => undefined
    }, [hasTouch])

    const {scrolling} = useScrollHorizontal(elementRef, {horizontal, vertical, initOptions})

    return (
        <Box
            {...otherProps}
            ref={mergingRefs(ref, elementRef)}
            {...hasTouch ? {ref: undefined} : undefined}
            className={classes('Scrollable-ab5c', className, {scrolling})}
            style={{
                cursor: 'grab',
                overflowX: horizontal ? 'auto' : 'hidden',
                overflowY: vertical ? 'auto' : 'hidden',
                ...style,
                ...scrollingStyle?.(scrolling),
            }}
        />
    )
}))

// Types ///////////////////////////////////////////////////////////////////////

export interface ScrollableProps extends BoxProps {
    horizontal?: undefined | boolean
    vertical?: undefined | boolean
    scrollingStyle?: undefined | ((scrolling: boolean) => undefined | React.CSSProperties)
}
