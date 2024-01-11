export function displayName<F extends Function>(name: string, fn: F): F {
    ;(fn as unknown as Record<string, string>).displayName = name

    return fn
}
