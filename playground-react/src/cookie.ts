import {CookieOptions, maxAgeInDays} from '@eviljs/web/cookie'

export const CookieSpec: CookieOptions = {
    path: '/',
    maxAge: maxAgeInDays(30),
}
