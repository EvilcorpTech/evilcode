export class StdError extends Error {
    constructor(message?: undefined | string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InvalidArgument extends StdError {}
export class InvalidInput extends StdError {}

/**
* @throws Error
*/
export function throwError<T extends StdErrorConstructor>(args: ErrorDefinition<T>): never {
    const {type = StdError, message} = args

    throw new type(message)
}

/**
* @throws InvalidArgument
*/
export function throwInvalidArgument(message?: undefined | string) {
    return throwError({type: InvalidArgument, message})
}

/**
* @throws InvalidInput
*/
export function throwInvalidInput(message?: undefined | string) {
    return throwError({type: InvalidInput, message})
}

// Types ///////////////////////////////////////////////////////////////////////

export interface ErrorDefinition<T extends StdErrorConstructor> {
    type?: undefined | T
    message?: undefined | string
}

export interface StdErrorConstructor {
    new(message?: undefined | string): StdError
}

export interface StdError extends Error {
}
