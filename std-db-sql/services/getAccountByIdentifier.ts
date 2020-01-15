import { Account, AccountFromDataOptions } from './Account'
import { assertStringNotEmpty } from '@eviljs/std-lib/assert'
import { Db, ReadResult } from '..'

/*
* EXAMPLE
* // Secret Hash is omitted from the results by default...
* getAccountByIdentifier(db, identifier)
* // ...but it can be explicitly requested.
* getAccountByIdentifier(db, identifier, {withSecretHash: true})
*/
export async function getAccountByIdentifier(
    db: Db<GetAccountByIdentifierServices>,
    identifier: string,
    options?: AccountFromDataOptions,
) {
    assertStringNotEmpty(identifier, 'identifier')

    const $Account = db.Account ?? Account
    const query = [
        `SELECT *
            FROM \`${$Account.Table}\`
            WHERE identifier = ?
            LIMIT 1
        `, [identifier]
    ] as const
    const result = await db.query(...query) as ReadResult
    if (result.length !== 1) {
        return
    }
    const model = $Account.fromData(result[0], options)

    return model
}

// Types ///////////////////////////////////////////////////////////////////////

export type GetAccountByIdentifierServices = {
    Account?: Account
}