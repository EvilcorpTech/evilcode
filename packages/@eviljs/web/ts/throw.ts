import {throwError, StdError} from '@eviljs/std/throw.js'

export class InvalidResponse extends StdError {}

export function throwInvalidResponse(message?: undefined | string): never {
    return throwError(new InvalidResponse(message))
}
