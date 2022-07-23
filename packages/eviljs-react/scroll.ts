import {useLayoutEffect} from 'react'

export function usePageScroll(onScroll: ScrollListener) {
    useLayoutEffect(() => {
        function onPageScroll(event: Event) {
            if (event.target !== event.currentTarget) {
                return
            }

            onScroll(document.scrollingElement as HTMLElement)
        }

        document.addEventListener('scroll', onPageScroll, {passive: true})

        function onClean() {
            document.removeEventListener('scroll', onPageScroll)
        }

        return onClean
    }, [onScroll])
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ScrollListener {
    (element: HTMLElement): void
}
