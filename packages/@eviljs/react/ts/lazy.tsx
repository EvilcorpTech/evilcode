import {lazy, Suspense} from 'react'
import {classes} from './classes.js'
import {ErrorBoundary} from './error-boundary.js'
import type {SvgProps} from './svg.js'

export function suspended<P extends object>(
    load: LazyLoader<P>,
    Fallback?: undefined | LazyFallback<P>,
): React.ComponentType<P> {
    const LazyComponent = lazy(() => load().then(asDefault)) as unknown as React.ComponentType<P>

    function LazySuspended(props: P) {
        return (
            <Suspense
                fallback={Fallback ? <Fallback {...props}/> : undefined}
                children={<LazyComponent {...props}/>}
            />
        )
    }
    LazySuspended.displayName = 'LazySuspended'

    return LazySuspended
}

export function suspendedIcon<P extends SvgProps>(
    load: LazyLoader<P>,
    FallbackIconOptional?: undefined | LazyFallback<P>,
): React.ComponentType<P> {
    const Fallback = FallbackIconOptional ?? FallbackIcon
    const LazySuspendedIcon = suspended(load, Fallback)

    function ErrorBoundedLazySuspendedIcon(props: P) {
        // An error loading an icon should not take down an entire app.
        return (
            <ErrorBoundary
                fallback={error => (console.error(error), <Fallback {...props}/>)}
            >
                <LazySuspendedIcon {...props}/>
            </ErrorBoundary>
        )
    }
    ErrorBoundedLazySuspendedIcon.displayName = 'ErrorBoundedLazySuspendedIcon'

    return ErrorBoundedLazySuspendedIcon
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
export type LazyFallback<P extends object> = React.ComponentType<P>
