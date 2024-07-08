export function times(count: number): Array<number> {
    return Array(count).fill(undefined).map((nil, idx) => idx)
}

/*
* Creates an iterator with an upper bound.
*
* EXAMPLE
*
* for (const it of iterate(10)) {
* }
*/
export function* iterate(times: number): Generator<number, void, never> {
    let idx = 0
    while (idx < times) {
        yield idx
        idx += 1
    }
}
