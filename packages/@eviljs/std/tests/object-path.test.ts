import {getObjectPath, setObjectPath} from '@eviljs/std/object-path'
import {cloneDeep} from '@eviljs/std/struct'
import Assert from 'node:assert'
import {describe, test} from 'node:test'

describe('@eviljs/std/object-path', (ctx) => {
    const leaf = 'initial value'
    const tree = [
        {
            'Hello World': {
                1: {
                    key: leaf,
                },
            },
        },
    ]

    test('getObjectPath()', (ctx) => {
        Assert.strictEqual(getObjectPath(tree, [0, 'Hello World', 1, 'key']), leaf)
    })

    test('setObjectPath()', (ctx) => {
        const newTree = cloneDeep(tree)
        const newValue = 'replaced value'
        const oldValue = setObjectPath(newTree, [0, 'Hello World', 1, 'key'], newValue)

        Assert.strictEqual(oldValue, leaf)
        Assert.strictEqual(newTree[0]!['Hello World'][1].key, newValue)
    })
})
