import {throwError, StdError} from '@eviljs/std/throw.js'

export class InvalidResponse extends StdError {}

export function throwInvalidResponse(message?: undefined | string) {
    return throwError(new InvalidResponse(message))
}
