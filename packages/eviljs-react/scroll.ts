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

        function onUnmount() {
            document.removeEventListener('scroll', onPageScroll)
        }

        return onUnmount
    }, [onScroll])
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ScrollListener {
    (element: HTMLElement): void
}
