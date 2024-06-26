interface BooleanConstructor {
    // (): false

    <T>(value?: void | undefined | null | false | 0 | 0n | '' | T): value is (
        T extends void | undefined | null | false | 0 | 0n | ''
            ? never
            : T
    )
}
