import {classes} from '@eviljs/std-react/react.js'
import {createElement} from 'react'

export function AccountIcon(props: AccountIconProps) {
    return (
        <svg
            {...props}
            className={classes('StdIcon', 'std-icon', props.className)}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
        >
            <path
                strokeWidth="0"
                d="M255.999,0c-74.443,0-135,60.557-135,135s60.557,135,135,135s135-60.557,135-135S330.442,0,255.999,0z"/>
            <path
                strokeWidth="0"
                d="M478.48,398.68C438.124,338.138,370.579,302,297.835,302h-83.672c-72.744,0-140.288,36.138-180.644,96.68l-2.52,3.779V512 h450h0.001V402.459L478.48,398.68z"
            />
        </svg>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AccountIconProps {
    className?: string
    [key: string]: unknown
}
