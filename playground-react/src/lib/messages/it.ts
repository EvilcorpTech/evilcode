export default {
    'Home': 'Casa',
    '@{n} items': ({n}: {n: number}) =>
        n === 1
            ? '1 elemento'
            : `${n} elementi`
    ,
}
