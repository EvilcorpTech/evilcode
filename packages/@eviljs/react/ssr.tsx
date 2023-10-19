import type {Task} from '@eviljs/std/fn.js'
import {lazy, Suspense, useEffect, useLayoutEffect, useRef} from 'react'
import {Box, type BoxProps} from './box.js'
import {asDefault, type LazyFallback, type LazyLoader} from './lazy.js'
import type {VoidProps} from './type.js'

export enum SuspenseSsrAttribute {
    Id = 'data-suspense-id',
}

export const SuspendedSsrElements = collectSuspendedSsrElements()

export const LazySuspendedSsrNames = new Set<string>()

export function lazySuspendedSsr<P extends object, F extends P>(
    load: LazyLoader<P>,
    fallback?: undefined | LazyFallback<F>,
): React.ComponentType<Omit<P, keyof SuspenseSsrHtmlAttributes> & LazySuspendedSsrProps> {
    const ComponentLazy = lazy(() => load().then(asDefault)) as unknown as React.ComponentType<P>

    function LazySuspendedSsr(props: Omit<P, keyof SuspenseSsrHtmlAttributes> & LazySuspendedSsrProps) {
        const {ssrId, ...otherProps} = props

        return (
            <SuspenseSsr
                ssrId={ssrId}
                fallback={() => fallback?.(otherProps as F)}
            >
                {suspenseAttrs =>
                    <ComponentLazy
                        {...otherProps as P}
                        {...suspenseAttrs}
                    />
                }
            </SuspenseSsr>
        )
    }
    LazySuspendedSsr.displayName = 'LazySuspendedSsr'

    return LazySuspendedSsr
}

export function SuspenseSsr(props: SuspenseSsrProps) {
    const {ssrId, fallback, children} = props
    const suspenseAttrs = withSuspenseSsrAttributes(ssrId)
    const elementSsr = SuspendedSsrElements.get(ssrId)

    return (
        <Suspense
            fallback={
                elementSsr ?
                    <SsrFallback
                        {...suspenseAttrs}
                        tag={elementSsr.tag}
                        attributes={elementSsr.attributes}
                        children={elementSsr.content}
                        // onUnmount={() => LazySuspendedSsrElements.delete(key)}
                    />
                :
                    fallback?.()
            }
            children={children(suspenseAttrs)}
        />
    )
}

export function BarrierSsr(props: BarrierSsrProps) {
    const {ssrId, if: guard, fallback, children} = props
    const elementSsr = SuspendedSsrElements.get(ssrId)
    const suspenseAttrs = withSuspenseSsrAttributes(ssrId)

    if (! guard && elementSsr) {
        return (
            <SsrFallback
                {...suspenseAttrs}
                tag={elementSsr.tag}
                attributes={elementSsr.attributes}
                children={elementSsr.content}
            />
        )
    }
    if (! guard && ! elementSsr) {
        return fallback?.()
    }

    return children(suspenseAttrs)
}

export function SsrFallback(props: SsrFallbackProps) {
    const {attributes, children, className, tag, onUnmount} = props
    const elementRef = useRef<Element>(null)

    useLayoutEffect(() => {
        const element = elementRef.current

        if (! element) {
            return
        }

        for (const it of attributes) {
            element.setAttribute(it.name, it.value)
        }

        element.classList.add('SsrFallback-ba1e')
    }, [])

    useEffect(() => {
        function onClean() {
            onUnmount?.()
        }

        return onClean
    }, [])

    return (
        <Box
            // {...otherProps}
            ref={elementRef}
            tag={tag}
            dangerouslySetInnerHTML={{__html: children}}
        />
    )
}

export function ssrIdOf(attrs: SuspenseSsrHtmlAttributes) {
    return attrs[SuspenseSsrAttribute.Id]
}

export function withSuspenseSsrAttributes(id: string): SuspenseSsrHtmlAttributes {
    return {
        [SuspenseSsrAttribute.Id]: escapeHtmlAttributeValue(id),
    }
}

export function collectSuspendedSsrElements() {
    const attrId = SuspenseSsrAttribute.Id

    return new Map(
        Array.from(document.querySelectorAll(`[${attrId}]`)).map(it => [
            it.getAttribute(attrId) ?? '',
            {
                id: it.getAttribute(attrId) ?? undefined,
                tag: it.tagName,
                attributes: Array.from(it.attributes),
                content: it.innerHTML,
            },
        ])
    )
}

export function escapeHtmlAttributeValue(value: string): string {
    return value // Placeholder.
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LazySuspendedSsrProps {
    ssrId: string
}

export interface SuspenseSsrProps {
    ssrId: string
    children: (attrs: SuspenseSsrHtmlAttributes) => React.ReactNode
    fallback?: undefined | (() => React.ReactNode)
}

export interface BarrierSsrProps {
    ssrId: string
    if: boolean
    children(attrs: SuspenseSsrHtmlAttributes): React.ReactNode
    fallback?: undefined | (() => React.ReactNode)
}

export interface SsrFallbackProps extends VoidProps<BoxProps> {
    attributes: Array<Attr>
    children: string
    onUnmount?: undefined | Task
}

export interface SuspenseSsrHtmlAttributes {
    [SuspenseSsrAttribute.Id]: string
}
