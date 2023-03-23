import {assertNumber} from '@eviljs/std/assert.js'
import type {Db, ReadResult} from '../index.js'
import type {AccountFromDataOptions} from './Account.js'
import {Account} from './Account.js'

/*
* EXAMPLE
*
* // Secret Hash is omitted from the results by default...
* getAccount(db, id)
* // ...but it can be explicitly requested.
* getAccount(db, id, {withSecretHash: true})
*/
export async function getAccount(db: Db<GetAccountServices>, id: number, options?: AccountFromDataOptions) {
    assertNumber(id, 'id')

    const $Account = db.Account ?? Account
    const query = [
        `SELECT *
            FROM \`${$Account.Table}\`
            WHERE id = ?
            LIMIT 1
        `, [id]
    ] as const
    const result = await db.query(...query) as ReadResult
    if (result.length !== 1) {
        return
    }
    const model = $Account.fromData(result[0]!, options)

    return model
}

// Types ///////////////////////////////////////////////////////////////////////

export type GetAccountServices = {
    Account?: Account
}
