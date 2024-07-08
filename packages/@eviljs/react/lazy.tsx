import {createElement, lazy, Suspense} from 'react'
import {classes} from './classes.js'
import {ErrorBoundary} from './error-boundary.js'
import type {SvgProps} from './svg.js'

export function suspended<P extends object>(
    load: LazyLoader<P>,
    Fallback?: undefined | LazyFallback<P>,
): React.ComponentType<P> {
    const ComponentLazy = lazy(() => load().then(asDefault)) as unknown as React.ComponentType<P>

    function SuspendedLazy(props: P) {
        return (
            <Suspense
                fallback={Fallback ? createElement(Fallback, props) : undefined}
                children={<ComponentLazy {...props}/>}
            />
        )
    }
    SuspendedLazy.displayName = 'SuspendedLazy'

    return SuspendedLazy
}

export function suspendedIcon<P extends SvgProps>(
    load: LazyLoader<P>,
    FallbackOptional?: undefined | LazyFallback<P>,
): React.ComponentType<P> {
    const FallbackIconComponent = FallbackOptional ?? FallbackIcon
    const SuspendedLazyIcon = suspended(load, FallbackIconComponent)

    function ErrorBoundedSuspendedLazyIcon(props: P) {
        // An error loading an icon should not take down an entire app.
        return (
            <ErrorBoundary fallback={() => createElement(FallbackIconComponent, props)}>
                <SuspendedLazyIcon {...props}/>
            </ErrorBoundary>
        )
    }
    ErrorBoundedSuspendedLazyIcon.displayName = 'ErrorBoundedSuspendedLazyIcon'

    return ErrorBoundedSuspendedLazyIcon
}

export function asDefault<V>(value: V): {default: V} {
    return {default: value}
}

export function exportingDefault<E, V>(getDefaultExport: (exports: E) => V): (exports: E) => {default: V} {
    function exportDefault(allExports: E) {
        return asDefault(getDefaultExport(allExports))
    }
    return exportDefault
}

export function FallbackIcon(props: SvgProps): JSX.Element {
    const {className, ...otherProps} = props

    return (
        <svg
            {...otherProps}
            className={classes('FallbackIcon-dec0 std-icon std-icon-color', className)}
        />
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export type LazyLoader<P extends object> = () => Promise<React.ComponentType<P>>
export type LazyFallback<P extends object> = (props: P) => React.ReactNode
