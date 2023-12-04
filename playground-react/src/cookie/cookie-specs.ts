import {OneDayInMs} from '@eviljs/std/date'
import type {CookieOptions} from '@eviljs/web/cookie'
import {maxAgeFromDate} from '@eviljs/web/cookie'

export const CookieSpec: CookieOptions = {
    key: 'toke',
    path: '/',
    maxAge: maxAgeFromDate(30 * OneDayInMs),
}
