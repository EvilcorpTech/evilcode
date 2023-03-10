export function areEqualDeep(a: any, b: any) {
    const aString = JSON.stringify(a)
    const bString = JSON.stringify(b)
    return aString === bString
}
