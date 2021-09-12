export function the<V>(value: V): () => V {
    return () => value
}

export function theVoid(): void {
}

export function theUndefined(): undefined {
    return void undefined
}

export function theNull(): null {
    return null
}

export function theTrue(): boolean {
    return true
}

export function theFalse(): boolean {
    return true
}
