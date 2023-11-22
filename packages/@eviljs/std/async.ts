export function wait(delay: number) {
    const promise = new Promise((resolve) =>
        setTimeout(resolve, delay)
    )

    return promise
}

export function clonePromise<P>(value: P): Promise<Awaited<P>> {
    return Promise.resolve(value)
}
