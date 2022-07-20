export default {
    '@{n} items'(args: {n: number}) {
        return args.n === 1
            ? '1 element'
            : `${args.n} elements`
    },
}
