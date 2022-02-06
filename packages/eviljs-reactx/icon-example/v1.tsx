import {classes} from '@eviljs/web/classes.js'

export function ExampleIcon(props: ExampleIconProps) {
    const {className, ...otherProps} = props

    return (
        <svg
            {...otherProps}
            className={classes('std-icon', className)}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
        >
            <path
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
            />
            <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.5 17.5L13.875 13.875"
            />
        </svg>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ExampleIconProps extends React.SVGAttributes<SVGSVGElement> {
}
