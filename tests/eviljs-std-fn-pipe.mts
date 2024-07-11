import {awaiting, catching, catchingError, chaining, logging, mapNone, mapSome, mappingNone, mappingOptional, mappingResultError, mappingSome, trying} from '../packages/@eviljs/std/fn-monad.js'
import {chain, piped, piping} from '../packages/@eviljs/std/fn-pipe.js'
import {ResultError} from '../packages/@eviljs/std/result.js'
import {throwError} from '../packages/@eviljs/std/throw.js'

const subject = {id: 1, name: 'Mike', age: 18}

const r_a1 = chain(subject,
    it => console.log(it.id),
    it => console.log(it.name),
)

const r_b1 = piping(subject)()
const r_b2 = piping(subject)
    (it => it.name)
    (it => `Hello ${it}!`)
()

const r_c1 = piped(subject)
    .to(it => ({...it, name: `${it.name} Tyson`}))
    .to(trying(it => it, error => throwError({message: 'Something wrong happened.'})))
    .to(it => it.age >= 18 ? it : ResultError('TooYoung'))
    .to(mappingResultError(error => ({name: error.error, age: 0})))
    .to(chaining(console.log))
    .to(logging(it => `Value is: ${it}`, 'debug'))
    .to(it => `${it.name} ${it.age} years old!`)
    .to(it => `Hello, ${it}`)
.end()
const r_c2 = await piped(subject)
    .to(it => Promise.resolve(it))
    .to(awaiting(it => Promise.resolve(({...it, name: `Hello ${it.name}`}))))
    .to(awaiting(logging()))
    .to(it => it)
    .to(awaiting(it => Promise.resolve(it.name)))
    .to(catching(error => ResultError(error)))
    .to(catchingError('BadThingsHappen'))
.end()
const r_c3 = piping(undefined as undefined | number)
    (mappingSome(it => 'Some' as const))
    (mappingNone(it => 'None' as const))
    (it => it)
    (mappingOptional(onSome, it => 'No Value'))
()
const r_c4 = mapSome(undefined as undefined | number, it => String(it))
const r_c5 = mapNone(undefined as undefined | number, it => 'Hello')

function onSome(value: string) { return {title: `onSome ${value}` } }
