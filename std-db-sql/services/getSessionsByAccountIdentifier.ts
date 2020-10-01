import {Account} from './Account.js'
import {assertStringNotEmpty} from '@eviljs/std-lib/assert.js'
import {Db, ReadResult} from '../index.js'
import {Session} from './Session.js'

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
        `, [accountIdentifier.toLowerCase()]
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
