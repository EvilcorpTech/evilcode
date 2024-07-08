import {Box, type BoxProps} from '@eviljs/react/box.js'
import {classes} from '@eviljs/react/classes.js'
import {asDefault, type LazyFallback, type LazyLoader} from '@eviljs/react/lazy.js'
import type {VoidProps} from '@eviljs/react/type.js'
import {lazy, Suspense, useLayoutEffect, useRef} from 'react'

export const SuspenseSsrAttribute = {
    Id: 'data-suspense-id' as const,
}

export const SuspendedSsrElements: Map<string, {
    id: undefined | string
    tag: string
    attributes: Array<Attr>
    content: string
}> = collectSuspendedSsrElements()

export const LazySuspendedSsrNames: Set<string> = new Set()

export function lazySuspendedSsr<P extends object, F extends P>(
    load: LazyLoader<P>,
    fallback?: undefined | LazyFallback<F>,
): React.ComponentType<
    & Omit<P, keyof SuspenseSsrHtmlAttributes>
    & LazySuspendedSsrProps
> {
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

export function SuspenseSsr(props: SuspenseSsrProps): JSX.Element {
    const {ssrId, fallback, children} = props
    const elementSsr = SuspendedSsrElements.get(ssrId)

    return (
        <Suspense
            fallback={
                elementSsr ?
                    <SsrRender
                        tag={elementSsr.tag}
                        attributes={elementSsr.attributes}
                        children={elementSsr.content}
                    />
                :
                    fallback?.()
            }
            children={children(withSuspenseSsrAttributes(ssrId))}
        />
    )
}

export function BarrierSsr(props: BarrierSsrProps): React.ReactNode {
    const {ssrId, if: guard, fallback, children} = props
    const elementSsr = SuspendedSsrElements.get(ssrId)

    if (! guard && elementSsr) {
        return (
            <SsrRender
                tag={elementSsr.tag}
                attributes={elementSsr.attributes}
                children={elementSsr.content}
            />
        )
    }
    if (! guard && ! elementSsr) {
        return fallback?.()
    }

    return children(withSuspenseSsrAttributes(ssrId))
}

export function SsrRender(props: SsrRenderProps): JSX.Element {
    const {attributes, children, className, ...otherProps} = props
    const elementRef = useRef<Element>(null)

    const {
        class: attrClassName,
        style,
        ...otherAttrsProps
    } = Object.fromEntries(attributes.map(it => [it.name, it.value]))

    useLayoutEffect(() => {
        if (! style) {
            return
        }

        const styleAttr = [
            elementRef.current?.getAttribute('style'),
            style,
        ].filter(Boolean).join(';')

        if (! styleAttr) {
            return
        }

        elementRef.current?.setAttribute('style', styleAttr)
    }, [style])

    return (
        <Box
            {...otherAttrsProps}
            {...otherProps}
            className={classes('SsrRender-ba1e', attrClassName, className)}
            ref={elementRef}
            dangerouslySetInnerHTML={{__html: children}}
        />
    )
}

export function ssrIdOf(attrs: SuspenseSsrHtmlAttributes): string {
    return attrs[SuspenseSsrAttribute.Id]
}

export function withSuspenseSsrAttributes(id: string): SuspenseSsrHtmlAttributes {
    return {
        [SuspenseSsrAttribute.Id]: escapeHtmlAttributeValue(id),
    }
}

export function collectSuspendedSsrElements():
    Map<string, {
        id: undefined | string
        tag: string
        attributes: Array<Attr>
        content: string
    }>
{
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

export interface SsrRenderProps extends VoidProps<BoxProps> {
    attributes: Array<Attr>
    children: string
}

export interface SuspenseSsrHtmlAttributes {
    [SuspenseSsrAttribute.Id]: string
}
