import { Account } from './Account'
import { assertStringNotEmpty } from '@eviljs/std-lib/assert'
import { Db, ReadResult } from '..'
import { Session } from './Session'

async function getSessionsByAccountIdentifier(db: Db<GetSessionByAccountIdentifierServices>, accountIdentifier: string) {
    assertStringNotEmpty(accountIdentifier, 'accountIdentifier')

    const $Account = db.Account ?? Account
    const $Session = db.Session ?? Session
    const query = [
        `SELECT S.*
            FROM \`${$Session.Table}\` AS S
                INNER JOIN \`${$Account.Table}\` AS A
                ON S.account = A.id
            WHERE A.identifier = ?
        `, [accountIdentifier]
    ] as const
    const result = await db.query(...query) as ReadResult
    const model = result.map($Session.fromData)

    return model
}

// Types ///////////////////////////////////////////////////////////////////////

export type GetSessionByAccountIdentifierServices = {
    Account?: Account
    Session?: Session
}