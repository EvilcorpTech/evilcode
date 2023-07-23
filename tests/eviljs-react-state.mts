import {mergingState, useMergeState, type StateSetter} from '../packages/@eviljs/react/state.js'

type State = {a: number, b: string}
function setState(state: State | ((state: State) => State)) {
}

const patch = useMergeState(setState)
patch({a: 1})
patch({a: 1, b: undefined})
patch({a: 1, c: 123})

const merge1 = mergingState({a: 123})
const merge1r = merge1(undefined as any as State)
const merge2 = mergingState({a: 123, b: undefined})
const merge2r = merge2(undefined as any as State)
const merge3 = mergingState({a: 123, c: ''})
const merge3r = merge3(undefined as any as State)
setState(mergingState<State>({a: 123}))
setState(mergingState<State>({a: 123, b: undefined}))
setState(mergingState<State>({a: 123, c: ''}))
