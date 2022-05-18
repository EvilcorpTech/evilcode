export function returnReturning<V>(value: V): () => V {
    return () => value
}

export function returnValue<V>(value: V): V {
    return value
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
