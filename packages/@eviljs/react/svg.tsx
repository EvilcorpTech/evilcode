import {classes} from './classes.js'

export function defineSvg(definitionProps: SvgDefinitionProps) {
    const {name, children, className, viewBox, ...otherDefinitionProps} = definitionProps

    function Svg(props: SvgProps) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                {...otherDefinitionProps}
                {...props}
                className={classes(className, props.className)}
                viewBox={viewBox}
            >
                {children}
            </svg>
        )
    }

    Svg.displayName = name

    return Svg
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SvgDefinitionProps extends React.SVGAttributes<SVGSVGElement> {
    name?: undefined | string
    viewBox: string
}

export interface SvgProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
}
