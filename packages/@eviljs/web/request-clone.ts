import type {ObjectPartial} from '@eviljs/std/type.js'

/**
* @throws TypeError
**/
export function cloneRequest(request: Request, options?: undefined | ObjectPartial<RequestInit>): Request {
    return new Request(request, options as RequestInit)
}

/**
* @throws TypeError
**/
export function cloneRequestWithBody(request: Request): Request {
    return request.clone()
}
