import { Account, AccountFromDataOptions } from './Account'
import { assertStringNotEmpty } from '@eviljs/std-lib/assert'
import { Db, ReadResult } from '..'
import { Session } from './Session'
/*
* EXAMPLE
* // Secret Hash is omitted from the results by default...
* getAccountByToken(db, token)
* // ...but it can be explicitly requested.
* getAccountByToken(db, token, {withSecretHash: true})
*/
export async function getAccountByToken(
    db: Db<GetAccountByTokenServices>,
    token: string,
    options?: AccountFromDataOptions,
) {
    assertStringNotEmpty(token, 'token')

    const $Account = db.Account ?? Account
    const $Session = db.Session ?? Session
    const query = [
        `SELECT A.*
            FROM \`${$Account.Table}\` AS A
                INNER JOIN \`${$Session.Table}\` AS S
                ON A.id = S.account
            WHERE S.token = ?
            LIMIT 1
        `, [token]
    ] as const
    const result = await db.query(...query) as ReadResult
    if (result.length !== 1) {
        return
    }
    const model = $Account.fromData(result[0], options)

    return model
}

// Types ///////////////////////////////////////////////////////////////////////

export type GetAccountByTokenServices = {
    Account?: Account
    Session?: Session
}