import {compose} from '../packages/@eviljs/std/fn.js'

type State = {prova: number}

function applyReducer<R>(reduce: (state: State) => R) {
    return reduce({prova: 123})
}

const reducer1 = compose((it: State) => it.prova)(it => String(it))(it => it)()({prova: 123})
const stateReduced1 = applyReducer(compose
    ((it: State) => it.prova)
    (it => String(it))
    (it => it)
    ()
)
