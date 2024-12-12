import {Box, type BoxProps} from '@eviljs/react/box'
import {classes} from '@eviljs/react/classes'
import type {ElementProps, Props} from '@eviljs/react/props'
import type {TooltipPosition} from './tooltip.api.js'

export type {TooltipPosition} from './tooltip.api.js'

export function Tooltip(props: Props<TooltipProps>): undefined | React.JSX.Element {
    const {children, className, content, contentClass, contentProps, contentStyle, position, ...otherProps} = props

    if (! children) {
        return
    }

    return (
        <Box
            {...otherProps}
            className={classes('Tooltip-ccf9', className)}
            data-position={position}
        >
            {children}

            <div className="tooltip-content-root-21d5">
                <div
                    {...contentProps}
                    className={classes('tooltip-content-ac0e', contentClass, contentProps?.className)}
                    role="tooltip"
                    style={{...contentStyle, ...contentProps?.style}}
                >
                    {content}
                </div>
            </div>
        </Box>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface TooltipProps extends Omit<BoxProps, 'content'> {
    content: React.ReactNode
    contentClass?: undefined | string
    contentProps?: undefined | ElementProps<'div'>
    contentStyle?: undefined | React.CSSProperties
    position: TooltipPosition
}
