import type {CookieOptions} from '@eviljs/web/cookie'
import {maxAgeInDays} from '@eviljs/web/cookie'

export const CookieSpec: CookieOptions = {
    path: '/',
    maxAge: maxAgeInDays(30),
}
