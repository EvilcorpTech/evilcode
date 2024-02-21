import {
    composeReducersEntries,
    defineReducerAction,
    withId,
    type CompositeReducerOfEntries,
    type ReducerId,
    type ReducerTarget
} from '../packages/@eviljs/std/redux.js'

type State = {state: number}
const state = {state: 1}
const actionLiteral1 = defineReducerAction('a', (state: State, a: number, b: string) => state)
const actionLiteral2 = defineReducerAction('b', (state: State, a: string, b: boolean) => state)
const actionLiteral3 = defineReducerAction('c', (state: State, a: {kind: number}) => state)
const actionLiteral4 = defineReducerAction('d', (state: State) => state)
const actionLiteral5 = defineReducerAction('e', (state: State) => state)
const actionLiteral6 = defineReducerAction('z', (state: State, o: {type: number}) => state)
const actionGeneric1 = defineReducerAction(withId('a'), (state: State, a: number, b: string) => state)
const actionGeneric2 = defineReducerAction(withId('b'), (state: State, a: string, b: boolean) => state)
const actionGeneric3 = defineReducerAction(withId('c'), (state: State, a: {kind: number}) => state)
const actionGeneric4 = defineReducerAction(withId('d'), (state: State) => state)
const actionGeneric5 = defineReducerAction(withId('e'), (state: State) => state)
const actionGeneric6 = defineReducerAction(withId('z'), (state: State, o: {type: number}) => state)

const listWithLiteralIds = [
    [actionLiteral1.id, actionLiteral1.reducer],
    [actionLiteral2.id, actionLiteral2.reducer],
    [actionLiteral3.id, actionLiteral3.reducer],
    [actionLiteral4.id, actionLiteral4.reducer],
    [actionLiteral5.id, actionLiteral5.reducer],
    [actionLiteral6.id, actionLiteral6.reducer],
] satisfies Array<[ReducerId, ReducerTarget<any, Array<any>>]>
type CompositeReducerWithLiteralIds = CompositeReducerOfEntries<typeof listWithLiteralIds>
const reducerComposedWithLiteralIds = composeReducersEntries(listWithLiteralIds)

const listWithGenericIds: Array<[ReducerId, ReducerTarget<State, Array<any>>]> = [
    [actionGeneric1.id, actionGeneric1.reducer],
    [actionGeneric2.id, actionGeneric2.reducer],
    [actionGeneric3.id, actionGeneric3.reducer],
    [actionGeneric4.id, actionGeneric4.reducer],
    [actionGeneric5.id, actionGeneric5.reducer],
    [actionGeneric6.id, actionGeneric6.reducer],
]
type CompositeReducerWithGenericIds = CompositeReducerOfEntries<typeof listWithGenericIds>
const reducerComposedWithGenericIds = composeReducersEntries(listWithGenericIds)

reducerComposedWithLiteralIds(state, 'a', 123, '')
reducerComposedWithLiteralIds(state, 'b', '', true)
reducerComposedWithLiteralIds(state, 'c', {kind: 123})
reducerComposedWithLiteralIds(state, 'd')
reducerComposedWithLiteralIds(state, 'e')

reducerComposedWithGenericIds(state, 'a', 123, '')
reducerComposedWithGenericIds(state, 'b', '', true)
reducerComposedWithGenericIds(state, 'c', {kind: 123})
reducerComposedWithGenericIds(state, 'd')
reducerComposedWithGenericIds(state, 'e')
reducerComposedWithGenericIds(state, 'a', null, false, '')

reducerComposedWithLiteralIds(state, 'f')
reducerComposedWithLiteralIds(state, 'a', null, false, '')
