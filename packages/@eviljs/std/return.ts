export {returnInput as identity}

export function returnInput<V>(input: V): V {
    return input
}

export function returnVoid(): void {
}

export function returnUndefined(): undefined {
    return void undefined
}

export function returnNull(): null {
    return null
}

export function returnTrue(): true {
    return true
}

export function returnFalse(): false {
    return false
}

export function returningValue<V>(value: V): () => V {
    return () => value
}

export function returningVoid(fn: () => any): () => void {
    return () => void fn()
}
