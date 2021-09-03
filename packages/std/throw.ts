export class StdError extends Error {
    constructor(message?: undefined | string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InvalidArgument extends StdError {}

export function throwInvalidArgument(message?: undefined | string) {
    return throwError({type: InvalidArgument, message})
}

export function throwError<T extends StdErrorConstructor>(spec: ErrorSpec<T>): never {
    const {type = StdError, message} = spec

    throw new type(message)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ErrorSpec<T extends StdErrorConstructor> {
    type?: undefined | T
    message?: undefined | string
}

export interface StdErrorConstructor {
    new(message?: undefined | string): StdError
}

export interface StdError extends Error {
}
