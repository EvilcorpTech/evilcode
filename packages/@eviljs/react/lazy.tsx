import {lazy, Suspense} from 'react'
import {classes} from './classes.js'
import type {SvgProps} from './svg.js'
import {ErrorBoundary} from './error-boundary.js'

export function lazySuspended<P extends object>(
    load: LazyLoader<P>,
    Fallback?: undefined | LazyFallback<P>,
): React.ComponentType<P> {
    const ComponentLazy = lazy(() => load().then(asDefault)) as unknown as React.ComponentType<P>

    function LazySuspended(props: P) {
        return (
            <Suspense
                fallback={Fallback ? <Fallback {...props}/> : undefined}
                children={<ComponentLazy {...props}/>}
            />
        )
    }
    LazySuspended.displayName = 'LazySuspended'

    return LazySuspended
}

export function lazySuspendedIcon<P extends SvgProps>(load: LazyLoader<P>, icon?: undefined | LazyFallback<P>) {
    const LazySuspendedIcon = lazySuspended(load, icon ?? FallbackIcon)

    function LazySuspendedIconErrorBounded(props: P) {
        // An error loading an icon should not take down an entire app.
        return (
            <ErrorBoundary fallback={() => <FallbackIcon {...props}/>}>
                <LazySuspendedIcon {...props}/>
            </ErrorBoundary>
        )
    }
    LazySuspendedIconErrorBounded.displayName = 'LazySuspendedIconErrorBounded'

    return LazySuspendedIconErrorBounded
}

export function asDefault<V>(value: V) {
    return {default: value}
}

export function exportingDefault<E, V>(getDefaultExport: (allExports: E) => V) {
    function exportDefault(allExports: E) {
        return asDefault(getDefaultExport(allExports))
    }
    return exportDefault
}

export function FallbackIcon(props: SvgProps) {
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
