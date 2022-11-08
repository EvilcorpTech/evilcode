import {assertInteger} from '@eviljs/std/assert.js'
import type {Db, WriteResult} from '../index.js'
import {Session} from './Session.js'

export async function deleteSessionsByAccountId(db: Db<DeleteSessionByAccountIdServices>, accountId: number) {
    assertInteger(accountId, 'accountId')

    const $Session = db.Session ?? Session
    const query = [
        `DELETE FROM \`${$Session.Table}\`
            WHERE account = ?
            LIMIT 1
        `, [accountId]
    ] as const
    const result = await db.query(...query) as WriteResult

    return result.affectedRows > 0
}

// Types ///////////////////////////////////////////////////////////////////////

export type DeleteSessionByAccountIdServices = {
    Session?: Session
}
