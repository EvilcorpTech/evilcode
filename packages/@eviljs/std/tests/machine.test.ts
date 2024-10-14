import {piping} from '@eviljs/std/fn-pipe'
import {defineMachine} from '@eviljs/std/machine'
import Assert from 'node:assert'
import {describe, test} from 'node:test'

describe('@eviljs/std/machine', (ctx) => {
    test('defineMachine()', (ctx) => {
        enum StateType {
            Init = 'init',
            Ready = 'ready',
        }
        enum EventType {
            Update = 'update',
            Delete = 'delete',
        }

        type State =
            | {type: StateType.Init}
            | {type: StateType.Ready, name: string, message: string}

        type Event =
            | {type: EventType.Update, value: string}
            | {type: EventType.Delete, id: string}

        const Machine = defineMachine({
            StateType,
            EventType,

            createState(): State  {
                return {type: StateType.Init}
            },

            reduce(state, event: Event) {
                switch (state.type) {
                    case StateType.Init: {
                        switch (event.type) {
                            case EventType.Update: {
                                return {
                                    type: StateType.Ready,
                                    name: event.value,
                                    message: '',
                                }
                            }
                        }
                    }
                }
                return state
            },

            pipeline: [
                (newState, oldState, event) => {
                    if (newState.type !== StateType.Ready) {
                        return newState
                    }
                    return {...newState, message: `Hello ${newState.name}`}
                },
            ],

            effect(newState, oldState, event) {
            },
        })

        const machineState = piping(Machine.createState())
            (state => Machine.reduce(state, {type: EventType.Update, value: 'Mario'}))
        ()

        Assert.deepStrictEqual(machineState, {
            type: StateType.Ready,
            name: 'Mario',
            message: 'Hello Mario',
        })
    })
})
