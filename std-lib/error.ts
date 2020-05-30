export class StdError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InvalidArgument extends StdError {}

export function throwInvalidArgument(message?: string) {
    return error({type: InvalidArgument, message})
}

export function error<T extends StdErrorConstructor>(spec: ErrorSpec<T>): never {
    const {type = StdError, message} = spec

    throw new type(message)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ErrorSpec<T extends StdErrorConstructor> {
    type?: T
    message?: string
}

export interface StdErrorConstructor {
    new(message?: string): StdError
}

export interface StdError extends Error {
}