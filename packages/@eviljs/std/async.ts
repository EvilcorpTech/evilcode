export function wait(delay: number): Promise<void> {
    const promise = new Promise<void>((resolve) =>
        setTimeout(resolve, delay)
    )

    return promise
}
