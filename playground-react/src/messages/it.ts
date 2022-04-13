export default {
    'Home': 'Casa',
    '@{n} items'(args: {n: number}) {
        return args.n === 1
            ? '1 elemento'
            : `${args.n} elementi`
    },
}
