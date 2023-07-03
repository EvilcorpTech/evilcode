import {classes} from '@eviljs/react/classes.js'
import {HtmlSandbox as HtmlSandboxElement} from '@eviljs/webx/html-sandbox.js'
import {createElement} from 'react'

export const HtmlSandboxTag = 'html-sandbox'

export function HtmlSandbox(props: HtmlSandboxProps) {
    const {children, className, tag, ...otherProps} = props

    return (
        createElement(tag ?? HtmlSandboxTag, {
            ...otherProps,
            class: classes('HtmlSandbox-d25f', className),
        }, children)
    )
}

export function defineHtmlSandbox(tag = HtmlSandboxTag) {
    if (! customElements.get(tag)) { // HMR Compatibility.
        customElements.define(tag, HtmlSandboxElement)
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HtmlSandboxProps extends React.HTMLAttributes<HTMLElement> {
    tag?: undefined | string
    children: string
}
