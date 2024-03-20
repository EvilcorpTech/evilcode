interface Array<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): Array<
        T extends void | undefined | null | false | 0 | 0n | ''
            ? never
            : T
    >
}

interface ReadonlyArray<T> {
    filter(predicate: BooleanConstructor, thisArg?: any): Array<
        T extends void | undefined | null | false | 0 | 0n | ''
            ? never
            : T
    >
}
