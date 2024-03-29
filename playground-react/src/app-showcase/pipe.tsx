import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase'
import {ensureStringNotEmpty} from '@eviljs/std/assert'
import {
    awaiting,
    catching,
    catchingError,
    identity,
    mappingEither,
    mappingError,
    mappingErrorValue,
    mappingNone,
    mappingPromise,
    mappingResult,
    mappingSome,
    piping,
    then,
    trying,
} from '@eviljs/std/fn'
import {Error} from '@eviljs/std/result'

const someResult = piping(undefined as undefined | null | string)
    (mappingNone(it => 'Mario'))
    (mappingSome(it => ({name: `Super ${it}`, age: 21})))
()

const eitherResult = piping(someResult)
    (it => it.age > 18 ? it : Error('TooYoung' as const))
    (mappingEither(identity, identity))
    (trying(
        mappingResult(it => (ensureStringNotEmpty(it), it)),
        error => Error('BadString' as const),
    ))
    (mappingResult(it => it.name))
    (mappingError(it => {
        switch (it.error) {
            case 'TooYoung':
                return Error('Blocked' as const)
            case 'BadString':
                return 'John Snow' as const
        }
    }))
    (mappingErrorValue(it => `Ops ${it}`))
    (it => `Hello, ${it}!`)
()

const asyncResult = piping(Promise.resolve(eitherResult))
    (mappingPromise(identity, Error))
    (awaiting(identity))
    (then(identity))
    (then(identity, Error))
    (catching(Error))
    (catching(error => Error('BadRequest' as const)))
    (catchingError()) // Same of catching(Error).
    (catchingError('BadRequest' as const))
    (then(mappingResult(identity)))
    (then(mappingError(it => 'Hello World!')))
()

export default defineShowcase('Pipe', (props) => {
    return (
        <div>
        </div>
    )
})
