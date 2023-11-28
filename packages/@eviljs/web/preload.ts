import {isUndefined} from '@eviljs/std/type.js'
import type {JsonType, TextType} from './mimetype.js'

export function exposePreloadHintElement(attrs: PreloadElementAttrs) {
    const hintElement = findPreloadHint(attrs)

    if (hintElement) {
        return
    }

    return attachPreloadHintElement(createPreloadHintElement(attrs))
}

export function createPreloadHintElement(attrs: PreloadElementAttrs) {
    const element = document.createElement('link')

    for (const attrName in attrs) {
        const attrValue = attrs[attrName as keyof typeof attrs]

        if (isUndefined(attrValue)) {
            continue
        }

        element.setAttribute(attrName, attrValue)
    }

    return element
}

export function findPreloadHint(attrs: PreloadElementAttrs) {
    const selector = [
        'link',
        `[rel="${attrs.rel}"]`,
        `[href="${attrs.href}"]`,
        attrs.as ? `[as="${attrs.as}"]` : undefined,
        attrs.type ? `[type="${attrs.type}"]` : undefined,
        attrs.fetchPriority ? `[fetchPriority="${attrs.fetchPriority}"]` : undefined,
    ].filter(Boolean).join('')

    return document.querySelector(selector) ?? undefined
}

export function attachPreloadHintElement(element: Node) {
    document.head.append(element)
    return element
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PreloadElementAttrs {
    as?: undefined
        | 'fetch'
        | 'font'
        | (string & {})
        // Extend it as needed.
    crossOrigin?: undefined | 'anonymous' | 'use-credentials'
    fetchPriority?: undefined | 'auto' | 'low' | 'high'
    href: string
    rel: 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload'
    type?: undefined
        | typeof JsonType
        | typeof TextType
        | 'font/woff'
        | 'font/woff2'
        | (string & {})
        // Extend it as needed.
}
