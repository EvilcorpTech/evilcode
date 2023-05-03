export function preventEventDefault(event: Pick<Event, 'preventDefault'>) {
    event.preventDefault()
}

export function stopEventPropagation(event: Pick<Event, 'stopPropagation'>) {
    event.stopPropagation()
}

export function stopEventPropagationImmediately(event: Pick<Event, 'stopImmediatePropagation'>) {
    event.stopImmediatePropagation()
}

export function cancelEvent(event: Pick<Event, 'preventDefault' | 'stopPropagation'>) {
    event.preventDefault()
    event.stopPropagation()
}

export function cancelEventImmediately(event: Pick<Event, 'preventDefault' | 'stopImmediatePropagation'>) {
    event.preventDefault()
    event.stopImmediatePropagation()
}
