import {throwError, StdError} from '@eviljs/std/throw.js'

export class InvalidRequest extends StdError {}

export function throwInvalidRequest(message?: undefined | string) {
    return throwError({type: InvalidRequest, message})
}
