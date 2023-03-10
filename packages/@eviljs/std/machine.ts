export function dispatchMachineEvent<S extends object, E>(
    prevState: S,
    event: E,
    handler: MachineEventHandler<S, E>,
    observer?: MachineStateObserver<S>,
): S
{
    const nextState = {...prevState} // Shallow clone.
    let dirtyState = false

    const state = createMachineStateObserver(nextState, (state, prop, value, prevValue) => {
        if (value === prevValue) {
            return
        }

        dirtyState = true
        observer?.(state, prop, value, prevValue)
    })

    handler(state, event)

    return dirtyState
        ? nextState
        : prevState
}

export function createMachineStateObserver<S extends object>(state: S, observer?: MachineStateObserver<S>): S {
    const proxy = new Proxy(state, {
        get(state: any, prop) {
            return state[prop]
        },
        set(state: any, prop, value) {
            const prevValue = state[prop]

            state[prop] = value

            observer?.(state, prop, value, prevValue)

            return true
        },
    })

    return proxy
}

// Types ///////////////////////////////////////////////////////////////////////

export type MachineEventHandler<S extends object, E> = (
    state: S,
    event: E,
) => void

export type MachineStateObserver<S extends object> = (
    state: S,
    prop: string | number | symbol,
    value: any,
    prevValue: any,
) => void
