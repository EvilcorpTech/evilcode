import {Account} from './Account.js'
import {assertStringNotEmpty} from '@eviljs/std/assert.js'
import type {Db, WriteResult} from '../index.js'

export async function deleteAccountByIdentifier(db: Db<DeleteAccountByIdentifierServices>, identifier: string) {
    assertStringNotEmpty(identifier, 'identifier')

    const $Account = db.Account ?? Account
    const query = [
        `DELETE FROM \`${$Account.Table}\`
            WHERE identifier = ?
            LIMIT 1
        `, [identifier]
    ] as const
    const result = await db.query(...query) as WriteResult

    return result.affectedRows > 0
}

// Types ///////////////////////////////////////////////////////////////////////

export type DeleteAccountByIdentifierServices = {
    Account?: Account
}
