export async function generateAsync<Y, R>(generator: AsyncGenerator<Y, R, void>): Promise<[R, Array<Y>]> {
    const yields: Array<Y> = []

    while (true) {
        const it = await generator.next()

        if (! it.done) {
            yields.push(it.value)
            continue
        }

        return [it.value, yields]
    }
}
