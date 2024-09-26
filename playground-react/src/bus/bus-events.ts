import {defineBusEvent, exact, type BusEventPayloadOf} from '@eviljs/std/bus'

export const DemoBusEvent = {
    Example: defineBusEvent('demo/example', id => ({
        event: (data: {}) => [id, data],
        topic: () => exact(id),
    })),
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DemoBusEventPayload {
    Example: BusEventPayloadOf<typeof DemoBusEvent.Example>
}
