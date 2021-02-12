import React from 'react'
import {classes} from './react.js'

export const Fragment = React.Fragment

export function defineIcon(options: DefineIconProps) {
    const {name, children, className, viewBox, ...otherOptions} = options

    function Icon(props: IconProps) {
        const {className: propsClassName, ...otherProps} = props

        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                {...otherOptions}
                {...otherProps}
                className={classes(className, propsClassName)}
                viewBox={viewBox}
            >
                {children}
            </svg>
        )
    }

    Icon.displayName = name

    return Icon
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DefineIconProps extends React.SVGAttributes<SVGSVGElement> {
    name?: string
    viewBox: string
}

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
}
