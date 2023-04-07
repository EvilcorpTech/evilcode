export function areEqualIdentity<T>(a: T, b: T) {
    return a === b
}

export function areEqualDeepSerializable(a: any, b: any) {
    const aString = JSON.stringify(a)
    const bString = JSON.stringify(b)
    return aString === bString
}
