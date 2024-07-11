// Types ///////////////////////////////////////////////////////////////////////

export type None = undefined | null
export type Some<T> = NonNullable<T>

export type VoidUndefined<T> = T extends void ? undefined : T

export type ObjectComplete<T extends object> = {
    [P in keyof T]-?: Exclude<T[P], undefined>
}

export type ObjectPartial<T extends object> = {
    [K in keyof T]?: undefined | T[K]
}

export type ObjectPartialDeep<T extends object> = {
    [K in keyof T]?: undefined | (T[K] extends object ? ObjectPartialDeep<T[K]> : T[K])
}

export type Unsafe<T> =
    T extends None | boolean | number | string | symbol
        ? None | Partial<T>
    : T extends Array<infer I>
        ? None | Partial<Array<Unsafe<I>>>
    : T extends object
        ? None | Partial<{[key in keyof T]?: None | Unsafe<T[key]>}>
    : unknown

export type UnsafeObject<T extends object> = NonNullable<Unsafe<T>>

export type ValueOf<T> = T[keyof T]

// export type ElementOf<A extends Array<unknown>> = A[number]
export type ElementOf<A extends Array<unknown>> =
    A extends Array<infer T>
        ? T
        : never

export type UnionOf<T extends Array<unknown>> = T[number]

export type Writable<T> = { -readonly [P in keyof T]: T[P] }
export type WritableDeep<T> = { -readonly [P in keyof T]: WritableDeep<T[P]> }

export type StringAutocompleted = string & {}

export type Prettify<T> = {} & {
    [K in keyof T]: T[K]
}
