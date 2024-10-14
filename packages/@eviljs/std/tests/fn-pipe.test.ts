import {
    awaiting,
    catching,
    catchingError,
    chaining,
    mapNone,
    mapSome,
    mappingNone,
    mappingOptional,
    mappingPromise,
    mappingResult,
    mappingResultError,
    mappingResultOrError,
    mappingSome,
    then,
    trying,
} from '@eviljs/std/fn-monad'
import {chain, piped, piping} from '@eviljs/std/fn-pipe'
import {identity} from '@eviljs/std/fn-return'
import {ResultError} from '@eviljs/std/result'
import {expectType} from '@eviljs/std/type'
import {ensureStringNotEmpty} from '@eviljs/std/type-ensure'
import Assert from 'node:assert'
import {describe, test} from 'node:test'

describe('@eviljs/std/fn-pipe', (ctx) => {
    type Subject = {id: number, name: string, age: number, admin: boolean}
    const subject: Subject = {id: 1, name: 'Mario', age: 18, admin: false}

    test('chain()', (ctx) => {
        {
            const result = chain(subject,
                it => it.id,
                it => it.name,
            )

            expectType<Subject>(result)
            Assert.strictEqual(result, subject)
        }
    })

    test('piping()', async (ctx) => {
        {
            const result = piping(subject)()

            expectType<Subject>(result)
            Assert.strictEqual(result, subject)
        }

        {
            const result = piping(subject)
                (it => it.name)
                (it => `Hello ${it}!`)
            ()

            expectType<string>(result)
            Assert.strictEqual(result, `Hello ${subject.name}!`)
        }

        {
            const result = piping([undefined, 'hello!'] as undefined | Array<undefined | string>)
                (chaining(expectType<undefined | Array<undefined | string>>))
                // @ts-expect-error
                (mappingSome((it: Array<string>) => it))
            ()

            expectType<undefined | Array<string>>(result)
        }

        {
            function onSome(it: string) {
                return it
            }

            const result = piping(undefined as undefined | string)
                (mappingSome(onSome))
                (chaining(expectType<undefined | string>))
                (mappingSome(it => ({title: `Super ${it}!`})))
                (mappingNone(it => it))
                (mappingOptional(it => it.title, it => null))
                (chaining(expectType<null | string>))
                (identity)
            ()

            expectType<null | string>(result)
            Assert.strictEqual(result, null)
        }

        {
            const result = piping(subject)
                (it => it.age >= 18 ? it : ResultError('TooYoung' as const))
                (mappingResultOrError(identity, identity))
                (trying(
                    mappingResult(it => (ensureStringNotEmpty(it.name), it)),
                    error => ResultError('BadString' as const),
                ))
                (identity)
                (chaining(expectType<Subject | ResultError<string>>))
                (mappingResult(it => it))
                (mappingResultError(error => error))
                (mappingResultError(it => {
                    switch (it.error) {
                        case 'TooYoung':
                        case 'BadString':
                            return ResultError('Blocked' as const)
                    }
                }))
            ()

            expectType<Subject | ResultError<'Blocked'>>(result)
            Assert.strictEqual(result, subject)
        }

        {
            const result = await piping(Promise.resolve(subject))
                (mappingPromise(identity, ResultError))
                (awaiting(identity))
                (then(identity))
                (then(identity, ResultError))
                (chaining(expectType<Promise<Subject | ResultError<unknown>>>))
                (catching(ResultError))
                (catchingError()) // Same of catching(ResultError).
                (catchingError('SomeError' as const))
                (then(mappingResult(identity)))
                (then(mappingResultError(error => ResultError('BadRequest' as const))))
            ()

            expectType<Subject | ResultError<'BadRequest'>>(result)
            Assert.deepStrictEqual(result, subject)
        }
    })

    test('piped()', (ctx) => {
        {
            const result = piped(subject)
            .to(identity)
            .to(identity)
            .end()

            expectType<Subject>(result)
            Assert.strictEqual(result, subject)
        }
    })

    test('mapSome()', (ctx) => {
        {
            const result = mapSome(undefined as undefined | number, it => String(it))

            expectType<undefined | string>(result)
            Assert.strictEqual(result, undefined)
        }

        {
            const result = mapSome(subject.name as undefined | string, it => ({title: it}) )

            expectType<undefined | {title: string}>(result)
            Assert.deepStrictEqual(result, {title: subject.name})
        }
    })

    test('mapNone()', (ctx) => {
        {
            const result = mapNone(undefined as undefined | number, it => subject.name)

            expectType<undefined | number | string>(result)
            Assert.strictEqual(result, subject.name)
        }
    })
})
