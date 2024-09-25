import {mergingState, useMergeState, type StateSetterArg} from '@eviljs/react/state'

type State = {a: number, b: string}
function setState(state: StateSetterArg<State>) {
}

const patch = useMergeState(setState)
patch({a: 1})
patch({a: 1, b: undefined})
patch({a: 1, c: 123})

const merge1 = mergingState({a: 123})
const merge2 = mergingState({a: 123, b: undefined})
const merge3 = mergingState({a: 123, c: ''})
const merge1r = merge1(undefined as any as State)
// @ts-expect-error
const merge2r = merge2(undefined as any as State)
// @ts-expect-error
const merge3r = merge3(undefined as any as State)
setState(mergingState<State>({a: 123}))
// @ts-expect-error
setState(mergingState<State>({a: 123, b: undefined}))
// @ts-expect-error
setState(mergingState<State>({a: 123, c: ''}))
