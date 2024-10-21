import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase.js'
import {
    awaiting,
    catching,
    catchingError,
    identity,
    mappingNone,
    mappingPromise,
    mappingResult,
    mappingResultError,
    mappingResultErrorValue,
    mappingResultOrError,
    mappingSome,
    piping,
    then,
    trying,
} from '@eviljs/std/fn'
import {ResultError} from '@eviljs/std/result'
import {ensureStringNotEmpty} from '@eviljs/std/type'

const someResult = piping(undefined as undefined | null | string)
    (mappingNone(it => 'Mario'))
    (mappingSome(it => ({name: `Super ${it}`, age: 21})))
()

const eitherResult = piping(someResult)
    (it => it.age > 18 ? it : ResultError('TooYoung' as const))
    (mappingResultOrError(identity, identity))
    (trying(
        mappingResult(it => (ensureStringNotEmpty(it), it)),
        error => ResultError('BadString' as const),
    ))
    (mappingResult(it => it.name))
    (mappingResultError(it => {
        switch (it.error) {
            case 'TooYoung':
                return ResultError('Blocked' as const)
            case 'BadString':
                return 'John Snow' as const
        }
    }))
    (mappingResultErrorValue(it => `Ops ${it}`))
    (it => `Hello, ${it}!`)
()

const asyncResult = piping(Promise.resolve(eitherResult))
    (mappingPromise(identity, ResultError))
    (awaiting(identity))
    (then(identity))
    (then(identity, ResultError))
    (catching(ResultError))
    (catching(error => ResultError('BadRequest' as const)))
    (catchingError()) // Same of catching(ResultError).
    (catchingError('BadRequest' as const))
    (then(mappingResult(identity)))
    (then(mappingResultError(it => 'Hello World!')))
()

export default defineShowcase('Pipe', (props) => {
    return (
        <div>
        </div>
    )
})
