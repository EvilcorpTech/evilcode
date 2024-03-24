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
export function throwError<E>(error: E): never {
    throw error
}

/**
* @throws InvalidArgument
*/
export function throwInvalidArgument(message?: undefined | string) {
    return throwError(new InvalidArgument(message))
}

/**
* @throws InvalidInput
*/
export function throwInvalidInput(message?: undefined | string) {
    return throwError(new InvalidInput(message))
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StdErrorConstructor {
    new(message?: undefined | string): StdError
}
