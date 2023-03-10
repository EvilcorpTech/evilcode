import {lazy, Suspense} from 'react'
import {classes} from './classes.js'
import type {SvgProps} from './svg.js'

export function suspended<P extends object>(
    load: SuspendedLoader<P>,
    fallback?: undefined | SuspendedFallback<P>,
) {
    const ComponentLazy = lazy(() => load().then(asDefault))

    function Suspended(props: P) {
        return (
            <Suspense fallback={fallback?.(props)}>
                <ComponentLazy {...props as P & React.PropsWithRef<P>}/>
            </Suspense>
        )
    }

    return Suspended
}

export function suspendedIcon<P extends SvgProps>(load: SuspendedLoader<P>) {
    return suspended(load, props =>
        <svg
            {...props}
            className={classes('std-icon', props.className)}
        />
    )
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

// Types ///////////////////////////////////////////////////////////////////////

export type SuspendedLoader<P extends object> = () => Promise<React.FunctionComponent<P>>
export type SuspendedFallback<P extends object> = (props: P) => React.ReactNode
