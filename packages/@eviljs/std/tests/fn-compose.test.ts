import {compose} from '@eviljs/std/fn-compose'
import {identity} from '@eviljs/std/fn-return'
import Assert from 'node:assert'
import {describe, test} from 'node:test'

describe('@eviljs/std/fn-compose', (ctx) => {
    test('compose()', (ctx) => {
        type State = {example: number}

        const runFunctions = compose
            ((it: State) => it.example)
            (it => String(it))
            (identity)
        ()

        Assert.strictEqual(runFunctions({example: 123}), '123')
        Assert.strictEqual(runFunctions({example: 456}), '456')
    })
})
