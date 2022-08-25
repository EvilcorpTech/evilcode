export function preventEventDefault(event: PreventableEvent) {
    event.preventDefault()
}

export function stopEventPropagation(event: StoppableEvent) {
    event.stopPropagation()
}

export function cancelEvent(event: PreventableEvent & StoppableEvent) {
    preventEventDefault(event)
    stopEventPropagation(event)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PreventableEvent {
    preventDefault(): void
}

export interface StoppableEvent {
    stopPropagation(): void
}
