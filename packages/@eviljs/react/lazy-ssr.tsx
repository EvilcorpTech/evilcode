import type {TaskVoid} from '@eviljs/std/fn.js'
import {lazy, Suspense, useEffect, useLayoutEffect, useRef} from 'react'
import {Box, type BoxProps} from './box.js'
import {asDefault, type LazySuspendedFallback, type LazySuspendedLoader} from './lazy.js'
import type {VoidProps} from './type.js'

export const LazySuspendedSsrNames = new Set<string>()

export const LazySuspendedSsrElements = new Map(
    Array.from(document.querySelectorAll('[data-suspense-name]')).map(it => [
        lazySuspendedSsrElementKey(
            it.getAttribute('data-suspense-name') ?? '' ,
            it.getAttribute('data-suspense-id') ?? '',
        ),
        {
            name: it.getAttribute('data-suspense-name') ?? undefined,
            id: it.getAttribute('data-suspense-id') ?? undefined,
            tag: it.tagName,
            attributes: Array.from(it.attributes),
            html: it.innerHTML,
        },
    ])
)

export function lazySuspendedSsr<P extends object>(
    name: string,
    load: LazySuspendedLoader<P>,
    fallback?: undefined | LazySuspendedFallback<any>,
): React.ComponentType<P & LazySuspendedSsrProps> {
    const ComponentLazy = lazy(() => load().then(asDefault)) as unknown as React.ComponentType<P>

    if (LazySuspendedSsrNames.has(name)) {
        console.warn(
            '@eviljs/react/lazy-ssr.lazySuspendedSsr(~~id~~, load, fallback)\n'
            + `name "${name}" is not unique.`
        )
    }

    LazySuspendedSsrNames.add(name)

    function LazySuspendedSsr(props: P & LazySuspendedSsrProps) {
        const {ssrId, ...otherProps} = props
        const key = lazySuspendedSsrElementKey(name, ssrId)
        const element = LazySuspendedSsrElements.get(key)

        return (
            <Suspense
                fallback={
                    element
                        ? <SsrFallback
                            data-suspense-name={name}
                            data-suspense-id={ssrId}
                            attributes={element.attributes}
                            children={element.html}
                            onUnmount={() => LazySuspendedSsrElements.delete(key)}
                        />
                    : fallback?.(otherProps)
                }
                children={
                    <ComponentLazy
                        {...otherProps as P}
                        data-suspense-name={name}
                        data-suspense-id={ssrId}
                    />
                }
            />
        )
    }
    LazySuspendedSsr.displayName = 'LazySuspendedSsr'

    return LazySuspendedSsr
}

export function SsrFallback(props: SsrFallbackProps) {
    const {attributes, children, className, onUnmount, ...otherProps} = props
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
            dangerouslySetInnerHTML={{__html: children}}
        />
    )
}

export function lazySuspendedSsrElementKey(name: string, cid: string) {
    return `${name}@${cid}`
}

// Types ///////////////////////////////////////////////////////////////////////

export interface LazySuspendedSsrProps {
    ssrId: string
}

export interface SsrFallbackProps extends VoidProps<BoxProps> {
    attributes: Array<Attr>
    children: string
    onUnmount?: undefined | TaskVoid
}
