interface Array<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): Array<
        T extends undefined | null | false | 0 | 0n | ''
            ? never
            : T
    >
}

interface ReadonlyArray<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): Array<
        T extends undefined | null | false | 0 | 0n | ''
            ? never
            : T
    >
}
