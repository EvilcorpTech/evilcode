import {defineMachine} from '../packages/@eviljs/std/machine.js'

enum StateType {
    Init = 'init',
    Ready = 'ready',
}

enum EventType {
    Update = 'update',
    Delete = 'delete',
}

export const MyMachine = defineMachine({
    StateType,
    EventType,

    createState(): MyMachineState  {
        return {type: StateType.Init}
    },

    reduce(state, event: MyMachineEvent) {
        switch (state.type) {
            case StateType.Init: {
                switch (event.type) {
                    case EventType.Update: {
                        return state
                    }
                }
            }
        }
        return state
    },

    pipeline: [
        (newState, oldState, event) => {
            return newState
        },
    ],

    log(newState, oldState, event) {
    },
})

MyMachine.EventType
MyMachine.StateType

export type MyMachineState =
    | {
        type: StateType.Init
    }
    | {
        type: StateType.Ready
        name: string
    }

export type MyMachineEvent =
    | {
        type: EventType.Update
        key: string
        value: string
    }
    | {
        type: EventType.Delete
        id: string
    }
