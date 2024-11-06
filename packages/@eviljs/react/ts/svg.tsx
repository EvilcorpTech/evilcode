import {classes} from './classes.js'
import type {ElementProps, Props, VoidProps} from './props.js'

export function defineSvg(definitionProps: SvgDefinitionProps): React.ComponentType<SvgProps> {
    const {
        children,
        className: definitionClassName,
        name,
        viewBox,
        ...otherDefinitionProps
    } = definitionProps

    function Svg(props: Props<SvgProps>) {
        const {className, ...otherProps} = props

        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox={viewBox}
                {...otherDefinitionProps}
                {...otherProps}
                className={classes(definitionClassName, className)}
                children={children}
            />
        )
    }

    Svg.displayName = name

    return Svg
}

// Types ///////////////////////////////////////////////////////////////////////

export interface SvgDefinitionProps extends ElementProps<'svg'> {
    name?: undefined | string
    viewBox: string
}

export interface SvgProps extends VoidProps<ElementProps<'svg'>> {
}
