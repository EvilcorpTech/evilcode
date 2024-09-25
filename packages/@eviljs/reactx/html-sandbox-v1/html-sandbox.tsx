import {classes} from '@eviljs/react/classes'
import {HtmlSandbox as HtmlSandboxElement} from '@eviljs/webx/html-sandbox'
import {createElement} from 'react'

export const HtmlSandboxTag = 'html-sandbox'

export function HtmlSandbox(props: HtmlSandboxProps): JSX.Element {
    const {children, className, tag, ...otherProps} = props

    return (
        createElement(tag ?? HtmlSandboxTag, {
            ...otherProps,
            class: classes('HtmlSandbox-d25f', className),
        }, children)
    )
}

export function defineHtmlSandbox(tagOptional?: undefined| string): void {
    const tag = tagOptional ?? HtmlSandboxTag

    if (! customElements.get(tag)) { // HMR Compatibility.
        customElements.define(tag, HtmlSandboxElement)
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HtmlSandboxProps extends React.HTMLAttributes<HTMLElement> {
    tag?: undefined | string
    children: string
}
