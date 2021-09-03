import {hashWithSalt} from '@eviljs/node/crypto.js'
import {throwInvalidRequest} from '@eviljs/node/throw.js'
import {assertObject, assertStringNotEmpty} from '@eviljs/std/assert.js'
import {Account} from './Account.js'
import {Db, ReadResult, WriteResult} from '../index.js'

/*
* Creates an user account.
*
* EXAMPLE
* createAccount(db, {identifier: 'foo.bar@world.com', secret: 'secret'})
*/
export async function createAccount(db: Db<CreateAccountServices>, model: CreateAccountModel) {
    assertObject(model, 'model')
    assertStringNotEmpty(model.identifier, 'model.identifier')
    assertStringNotEmpty(model.secret, 'model.secret')

    const $Account = db.Account ?? Account
    const data = $Account.toData(model)
    // First we check if an account with the same identifier already exists.
    const selectQuery = [
        `SELECT id
            FROM \`${$Account.Table}\`
            WHERE identifier = ?
        `, [data.identifier]
    ] as const
    const selectResult = await db.query(...selectQuery) as ReadResult
    const userDoesNotExist = selectResult.length === 0

    // If it exists, we throw an error.
    if (! userDoesNotExist) {
        return throwInvalidRequest(
            '@eviljs/node-db-sql/createAccount.createAccount(db, ~~model~~):\n'
            + 'model.identifier must not be used yet.'
        )
    }

    // Otherwise we can proceed creating the account.
    const secretHash = await hashWithSalt(model.secret)
    const insertQuery = [
        `INSERT INTO \`${$Account.Table}\`
            (identifier, secret_hash)
            VALUES (?, ?)
        `, [data.identifier, secretHash]
    ] as const
    const insertResult = await db.query(...insertQuery) as WriteResult

    // We return the new account id.
    return insertResult.insertId
}

// Types ///////////////////////////////////////////////////////////////////////

export type CreateAccountServices = {
    Account?: Account
}

export interface CreateAccountModel {
    identifier: string
    secret: string
}
