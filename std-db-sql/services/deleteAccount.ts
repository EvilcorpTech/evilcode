import {Account} from './Account.js'
import {assertInteger} from '@eviljs/std-lib/assert.js'
import {Db, WriteResult} from '../index.js'

export async function deleteAccount(db: Db<DeleteAccountServices>, accountId: number) {
    assertInteger(accountId, 'accountId')

    const $Account = db.Account ?? Account
    const query = [
        `DELETE FROM \`${$Account.Table}\`
            WHERE id = ?
            LIMIT 1
        `, [accountId]
    ] as const
    const result = await db.query(...query) as WriteResult

    return result.affectedRows > 0
}

// Types ///////////////////////////////////////////////////////////////////////

export type DeleteAccountServices = {
    Account?: Account
}

export interface DeleteAccountModel {
    identifier: string
    secret: string
}
