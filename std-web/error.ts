import {error, StdError} from '@eviljs/std-lib/error.js'

export class InvalidResponse extends StdError {}

export function throwInvalidResponse(message?: string) {
    return error({type: InvalidResponse, message})
}
