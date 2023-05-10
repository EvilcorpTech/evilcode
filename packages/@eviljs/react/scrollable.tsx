import './scrollable.css'

import {isUndefined} from '@eviljs/std/type.js'
import {forwardRef, useMemo, useRef} from 'react'
import {Box, type BoxProps} from './box.js'
import {useBrowserFeatures} from './browser.js'
import {classes} from './classes.js'
import {useScrollHorizontal} from './drag.js'
import {mergingRefs} from './ref.js'

export const Scrollable = forwardRef(function Scrollable(
    props: ScrollableProps,
    ref?: undefined | React.Ref<HTMLElement>,
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
                cursor: 'pointer',
                overflowX: horizontal ? 'auto' : 'hidden',
                overflowY: vertical ? 'auto' : 'hidden',
                ...style,
                ...scrollingStyle?.(scrolling),
            }}
        />
    )
})
Scrollable.displayName = 'Scrollable'

// Types ///////////////////////////////////////////////////////////////////////

export interface ScrollableProps extends BoxProps {
    horizontal?: undefined | boolean
    vertical?: undefined | boolean
    scrollingStyle?: undefined | ((scrolling: boolean) => undefined | React.CSSProperties)
}
