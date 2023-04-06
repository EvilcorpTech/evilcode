interface BooleanConstructor {
    // (): false

    <T>(value?: undefined | null | false | 0 | 0n | '' | T): value is (
        T extends undefined | null | false | 0 | 0n | ''
            ? never
            : T
    )
}
