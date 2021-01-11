export function wait(delay: number) {
    const promise = new Promise((resolve) =>
        setTimeout(resolve, delay)
    )

    return promise
}
