import {useEffect} from 'react'

export function useResizeObserver(
    containerRef: React.RefObject<HTMLElement>,
    onResize: ResizeObserverCallback,
) {
    useEffect(() => {
        const containerEl = containerRef.current

        if (! containerEl) {
            return
        }

        const observer = new ResizeObserver(onResize)

        observer.observe(containerEl)

        function onClean() {
            observer.disconnect()
        }

        return onClean
    }, [onResize])
}
