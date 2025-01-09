export class StdError extends Error {
    constructor(message?: undefined | string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InvalidArgument extends StdError {}
export class InvalidInput extends StdError {}

export class InvalidCondition extends StdError {}
export class InvalidType extends StdError {}

/**
* @throws Error
*/
export function throwError<E>(error: E): never {
    throw error
}

/**
* @throws InvalidArgument
*/
export function throwInvalidArgument(message?: undefined | string): never {
    return throwError(new InvalidArgument(message))
}

/**
* @throws InvalidInput
*/
export function throwInvalidInput(message?: undefined | string): never {
    return throwError(new InvalidInput(message))
}

/**
* @throws InvalidCondition
*/
export function throwInvalidCondition(message: string): never {
    return throwError(new InvalidCondition(message))
}

/**
* @throws InvalidType
*/
export function throwInvalidType(message: string): never {
    return throwError(new InvalidType(message))
}

// Types ///////////////////////////////////////////////////////////////////////

export interface StdErrorConstructor {
    new(message?: undefined | string): StdError
}
