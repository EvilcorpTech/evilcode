import {defineShowcase} from '@eviljs/reactx/showcase'
import {ensureStringNotEmpty} from '@eviljs/std/assert'
import {
    mappingCatch,
    mappingCatchError,
    mappingEither,
    mappingError,
    mappingErrorValue,
    mappingNone,
    mappingPromise,
    mappingResult,
    mappingSome,
    mappingThen,
    mappingTry,
    then,
} from '@eviljs/std/monad'
import {pipe} from '@eviljs/std/pipe'
import {Error} from '@eviljs/std/result'
import {identity} from '@eviljs/std/return'

const someResult = pipe(undefined as undefined | null | string)
    .to(mappingNone(it => 'Mario'))
    .to(mappingSome(it => ({name: `Super ${it}`, age: 21})))
.end()

const eitherResult = pipe(someResult)
    .to(it => it.age > 18 ? it : Error('TooYoung' as const))
    .to(mappingEither(identity, identity))
    .to(mappingTry(
        mappingResult(it => (ensureStringNotEmpty(it), it)),
        error => Error('BadString' as const),
    ))
    .to(mappingResult(it => it.name))
    .to(mappingError(it => {
        switch (it.error) {
            case 'TooYoung':
                return Error('Blocked' as const)
            case 'BadString':
                return 'John Snow' as const
        }
    }))
    .to(mappingErrorValue(it => `Ops ${it}`))
    .to(it => `Hello, ${it}!`)
.end()

const asyncResult = pipe(Promise.resolve(eitherResult))
    .to(then(identity, Error))
    .to(mappingThen(identity))
    .to(mappingCatch(Error))
    .to(mappingCatch(error => Error('BadRequest' as const)))
    .to(mappingPromise(identity, Error))
    .to(mappingCatchError()) // Same of mappingCatch(Error).
    .to(mappingCatchError('BadRequest' as const))
    .to(then(mappingResult(identity)))
    .to(then(mappingError(it => 'Hello World!')))
.end()

export default defineShowcase('Pipe', (props) => {
    return (
        <div>
        </div>
    )
})
