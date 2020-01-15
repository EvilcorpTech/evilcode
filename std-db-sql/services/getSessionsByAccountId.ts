import { assertInteger } from '@eviljs/std-lib/assert'
import { Db, ReadResult } from '..'
import { Session } from './Session'

export async function getSessionByAccountId(db: Db<GetSessionByAccountIdServices>, accountId: number) {
    assertInteger(accountId, 'accountId')

    const $Session = db.Session ?? Session
    const query = [
        `SELECT *
            FROM \`${$Session.Table}\`
            WHERE account = ?
        `, [accountId]
    ] as const
    const result = await db.query(...query) as ReadResult
    const model = result.map($Session.fromData)

    return model
}

// Types ///////////////////////////////////////////////////////////////////////

export type GetSessionByAccountIdServices = {
    Session?: Session
}