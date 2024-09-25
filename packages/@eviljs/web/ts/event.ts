export function preventEventDefault(event: Pick<Event, 'preventDefault'>): void {
    event.preventDefault()
}

export function stopEventPropagation(event: Pick<Event, 'stopPropagation'>): void {
    event.stopPropagation()
}

export function stopEventPropagationImmediately(event: Pick<Event, 'stopImmediatePropagation'>): void {
    event.stopImmediatePropagation()
}

export function cancelEvent(event: Pick<Event, 'preventDefault' | 'stopPropagation'>): void {
    event.preventDefault()
    event.stopPropagation()
}

export function cancelEventImmediately(event: Pick<Event, 'preventDefault' | 'stopImmediatePropagation'>): void {
    event.preventDefault()
    event.stopImmediatePropagation()
}
