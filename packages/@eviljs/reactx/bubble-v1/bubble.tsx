import './bubble.css'

import {Box, type BoxProps} from '@eviljs/react/box.js'
import {classes} from '@eviljs/react/classes.js'

export function Bubble(props: BubbleProps) {
  const {className, arrowPosition, ...otherProps} = props

  return (
    <Box
      {...otherProps}
      className={classes('Bubble-85f2', className)}
      data-arrow-position={arrowPosition}
    />
  )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BubbleProps extends BoxProps {
  arrowPosition: 'top' | 'left' | 'right' | 'bottom'
}
