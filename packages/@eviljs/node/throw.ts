import {throwError, StdError} from '@eviljs/std/throw.js'

export class InvalidRequest extends StdError {}

export function throwInvalidRequest(message?: undefined | string): never {
    return throwError(new InvalidRequest(message))
}
