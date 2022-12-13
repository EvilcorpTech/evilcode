import {defineShowcase} from '@eviljs/reactx/showcase'
import {ensureStringNotEmpty} from '@eviljs/std/assert'
import {identity} from '@eviljs/std/fn'
import {
    mapCatch,
    mapCatchError,
    mapEither,
    mapError,
    mapErrorValue,
    mapNone,
    mapPromise,
    mapResult,
    mapSome,
    mapThen,
    mapTrying,
    then,
} from '@eviljs/std/monad'
import {pipe} from '@eviljs/std/pipe'
import {Error} from '@eviljs/std/result'

const someResult = pipe(undefined as undefined | null | string)
    .to(mapNone(it => 'Mario'))
    .to(mapSome(it => ({name: `Super ${it}`, age: 21})))
.end()

const eitherResult = pipe(someResult)
    .to(it => it.age > 18 ? it : Error('TooYoung' as const))
    .to(mapEither(identity, identity))
    .to(mapTrying(
        mapResult(it => (ensureStringNotEmpty(it), it)),
        error => Error('BadString' as const),
    ))
    .to(mapResult(it => it.name))
    .to(mapError(it => {
        switch (it.error) {
            case 'TooYoung':
                return Error('Blocked' as const)
            case 'BadString':
                return 'John Snow' as const
        }
    }))
    .to(mapErrorValue(it => `Ops ${it}`))
    .to(it => `Hello, ${it}!`)
.end()

const asyncResult = pipe(Promise.resolve(eitherResult))
    .to(then(identity, Error))
    .to(mapThen(identity))
    .to(mapCatch(Error))
    .to(mapCatch(error => Error('BadRequest' as const)))
    .to(mapPromise(identity, Error))
    .to(mapCatchError()) // Same of mapCatch(Error).
    .to(mapCatchError('BadRequest' as const))
    .to(then(mapResult(identity)))
    .to(then(mapError(it => 'Hello World!')))
.end()

export default defineShowcase('Pipe', (props) => {
    return (
        <div>
        </div>
    )
})
