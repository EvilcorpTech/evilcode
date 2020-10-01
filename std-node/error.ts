import {error, StdError} from '@eviljs/std-lib/error.js'

export class InvalidRequest extends StdError {}

export function throwInvalidRequest(message?: string) {
    return error({type: InvalidRequest, message})
}
