import {assertStringNotEmpty} from '@eviljs/std-lib/assert'
import {Db, WriteResult} from '..'
import {Session} from './Session'

export async function deleteSessionByToken(db: Db<DeleteSessionByTokenServices>, token: string) {
    assertStringNotEmpty(token, 'token')

    const $Session = db.Session ?? Session
    const query = [
        `DELETE FROM \`${$Session.Table}\`
            WHERE token = ?
            LIMIT 1
        `, [token]
    ] as const
    const result = await db.query(...query) as WriteResult

    return result.affectedRows > 0
}

// Types ///////////////////////////////////////////////////////////////////////

export type DeleteSessionByTokenServices = {
    Session?: Session
}