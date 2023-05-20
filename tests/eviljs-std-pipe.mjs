import {asyncPipe, Error, pipe} from '../../packages/std/pipe.js'

const r1 = pipe({})
.to(it => ({...it, name: 'Mike'}))
.to(it => ({...it, age: 18}))
.to(it => it.age >= 18 ? it : Error('TooYoung'))
.to(it => it.name ? it : Error('EmptyName'))
.inspect(console.log)
.to(it => `${it.name} ${it.age} years old!`)
.errorTo(error => {
    switch (error) {
        case 'EmptyName': return 'anonymous!'
        case 'TooYoung': return Error('TooYoung')
    }
})
.to(it => Error('Ops'))
.to(it => `Hello, ${it}`)
.errorTo(error => Error('Hello, World!'))
.to(it => it)
.errorTo(error => 'Hello, World!')
.to(it => it)
.end()

const r2 = await asyncPipe({})
.to(it =>
    Promise.resolve(it)
    .then(it => ({...it, name: 'Mike', age: 18}))
    .catch(error => Error('BadRequest'))
)
.inspect(console.log)
.to(it => it.name)
.to(it => it.toLowerCase())
.errorTo(error => {
    switch (error) {
        case 'BadRequest': return 'Mike'
        case 'BadBody': return Error('TooYoung')
    }
})
.to(it => it.toUpperCase())
.end()
