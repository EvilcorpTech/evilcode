import {
    awaiting,
    catching,
    catchingError,
    chaining,
    logging,
    mapNone,
    mapSome,
    mappingNone,
    mappingOptional,
    mappingPromise,
    mappingResult,
    mappingResultError,
    mappingResultErrorValue,
    mappingResultOrError,
    mappingSome,
    then,
    trying,
} from '@eviljs/std/fn-monad'
import {chain, piped, piping} from '@eviljs/std/fn-pipe'
import {identity} from '@eviljs/std/fn-return'
import {ResultError} from '@eviljs/std/result'
import {throwError} from '@eviljs/std/throw'
import {ensureStringNotEmpty} from '@eviljs/std/type-ensure'

const subject = {id: 1, name: 'Mike', age: 18}

{const result = chain(subject,
    it => console.log(it.id),
    it => console.log(it.name),
)}

{const result = piping(subject)()}

{const result = piping(subject)
    (it => it.name)
    (it => `Hello ${it}!`)
()}

{const result = piping([undefined, 'hello!'])
    // @ts-expect-error
    (mappingSome((it: Array<string>) => it))
()}


{const result = piped(subject)
    .to(it => ({...it, name: `${it.name} Tyson`}))
    .to(trying(it => it, error => throwError({message: 'Something wrong happened.'})))
    .to(it => it.age >= 18 ? it : ResultError('TooYoung'))
    .to(mappingResult(it => it.age <= 100 ? it : ResultError('TooOld')))
    .to(it => it)
    .to(mappingResult(identity))
    .to(mappingResultError(error => ({name: error.error, age: 0})))
    .to(chaining(console.log))
    .to(logging(it => `Value is: ${it}`, 'debug'))
    .to(it => `${it.name} ${it.age} years old!`)
    .to(it => `Hello, ${it}`)
.end()}

{const result = await piped(subject)
    .to(it => Promise.resolve(it))
    .to(awaiting(it => Promise.resolve(({...it, name: `Hello ${it.name}`}))))
    .to(awaiting(logging()))
    .to(it => it)
    .to(awaiting(it => Promise.resolve(it.name)))
    .to(catching(error => ResultError(error)))
    .to(catchingError('BadThingsHappen'))
.end()}

{const result = piping(undefined as undefined | null | string)
    (mappingNone(it => 'Mario'))
    (mappingSome(it => ({name: `Super ${it}`, age: 21})))
()}

{const result = piping({name: 'Super Mario', age: 21})
    (it => it.age > 18 ? it : ResultError('TooYoung' as const))
    (mappingResultOrError(identity, identity))
    (trying(
        mappingResult(it => (ensureStringNotEmpty(it), it)),
        error => ResultError('BadString' as const),
    ))
    (it => it)
    (mappingResultError(error => error))
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
()}

{const result = piping(Promise.resolve('Hello!'))
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
()}

{const result = piping(undefined as undefined | number)
    (mappingSome(it => 'Some' as const))
    (mappingNone(identity))
    (mappingOptional(it => ({title: `Some ${it}`}), () => undefined))
    (mappingSome(identity))
    (mappingNone(() => 'None'))
    (identity)
    (it => it)
()}

{const result = mapSome(undefined as undefined | number, it => String(it))}

{const result = mapNone(undefined as undefined | number, it => 'Hello')}

function onSome(value: string) { return {title: `onSome ${value}` } }
