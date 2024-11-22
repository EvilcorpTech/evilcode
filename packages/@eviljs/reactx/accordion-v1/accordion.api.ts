import {flushStyles} from '@eviljs/web/animation'

export function animateAccordionOpen(element: HTMLElement): void {
    const eventOptions = {
        capture: false,
        passive: true,
    } satisfies AddEventListenerOptions

    function onTransitionEnd(event: TransitionEvent) {
        element.style.height = 'auto'
        element.removeEventListener('transitionend', onTransitionEnd, eventOptions)
    }

    element.addEventListener('transitionend', onTransitionEnd, eventOptions)
    element.style.height = element.scrollHeight + 'px'
}

export function animateAccordionClose(element: HTMLElement): void {
    const eventOptions = {
        capture: false,
        passive: true,
    } satisfies AddEventListenerOptions

    function onTransitionEnd(event: TransitionEvent) {
        element.style.height = ''
        element.removeEventListener('transitionend', onTransitionEnd, eventOptions)
    }

    element.style.height = element.scrollHeight + 'px'
    flushStyles(element)

    element.addEventListener('transitionend', onTransitionEnd, eventOptions)
    element.style.height = '0px'
}
