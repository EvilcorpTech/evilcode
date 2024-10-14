import {scheduleMacroTaskUsingTimeout, scheduleMicroTaskUsingPromise} from '@eviljs/std/eventloop'
import Assert from 'node:assert'
import {describe, test} from 'node:test'

describe('@eviljs/std/eventloop', (ctx) => {
    test('schedule{Micro,Marco}TaskUsing*()', async (ctx) => {
        const results: Array<string> = []

        await Promise.all([
            new Promise<void>(resolve => scheduleMicroTaskUsingPromise(() => { results.push('scheduleMicroTaskUsingPromise'); resolve() })),
            // new Promise<void>(resolve => scheduleMicroTaskUsingMutationObserver(() => { results.push('scheduleMicroTaskUsingMutationObserver'); resolve() })),
            new Promise<void>(resolve => scheduleMacroTaskUsingTimeout(() => { results.push('scheduleMacroTaskUsingTimeout'); resolve() })),
            // new Promise<void>(resolve => scheduleMacroTaskUsingPostMessage(() => { results.push('scheduleMacroTaskUsingPostMessage'); resolve() })),
            // new Promise<void>(resolve => scheduleMacroTaskUsingMessageChannel(() => { results.push('scheduleMacroTaskUsingMessageChannel'); resolve() })),

            new Promise<void>(resolve => scheduleMicroTaskUsingPromise(() => { results.push('scheduleMicroTaskUsingPromise'); resolve() })),
            // new Promise<void>(resolve => scheduleMicroTaskUsingMutationObserver(() => { results.push('scheduleMicroTaskUsingMutationObserver'); resolve() })),
            new Promise<void>(resolve => scheduleMacroTaskUsingTimeout(() => { results.push('scheduleMacroTaskUsingTimeout'); resolve() })),
            // new Promise<void>(resolve => scheduleMacroTaskUsingPostMessage(() => { results.push('scheduleMacroTaskUsingPostMessage'); resolve() })),
            // new Promise<void>(resolve => scheduleMacroTaskUsingMessageChannel(() => { results.push('scheduleMacroTaskUsingMessageChannel'); resolve() })),
        ])

        Assert.deepStrictEqual(results, [
            'scheduleMicroTaskUsingPromise',
            // 'scheduleMicroTaskUsingMutationObserver',
            'scheduleMicroTaskUsingPromise',
            // 'scheduleMicroTaskUsingMutationObserver',

            'scheduleMacroTaskUsingTimeout',
            // 'scheduleMacroTaskUsingPostMessage',
            // 'scheduleMacroTaskUsingMessageChannel',
            'scheduleMacroTaskUsingTimeout',
            // 'scheduleMacroTaskUsingPostMessage',
            // 'scheduleMacroTaskUsingMessageChannel',
        ])
    })
})
