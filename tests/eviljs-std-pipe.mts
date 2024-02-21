import {Error, awaiting, catching, catchingError, chain, chaining, identity, logging, mappingError, mappingOptional, mappingSome, piped, piping, trying} from '../packages/@eviljs/std/fn.js'
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
    .to(it => it.age >= 18 ? it : Error('TooYoung'))
    .to(mappingError(error => ({name: error.error, age: 0})))
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
    .to(catching(error => Error(error)))
    .to(catchingError('BadThingsHappen'))
.end()
const r_c3 = piping(undefined)
    (mappingSome(identity))
    (mappingOptional(onSome, it => 'No Value'))
()

function onSome(value: string) { return {title: `Some ${value}` } }
