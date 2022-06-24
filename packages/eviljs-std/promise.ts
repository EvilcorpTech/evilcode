export function isSettledFulfilled<T>(promise: PromiseSettledResult<T>): promise is PromiseFulfilledResult<T> {
    return promise.status === 'fulfilled'
}

export function isSettledRejected<T>(promise: PromiseSettledResult<T>): promise is PromiseRejectedResult {
    return promise.status === 'rejected'
}
