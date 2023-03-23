import {throwInvalidRequest} from '@eviljs/node/throw.js'
import type {Db} from '../index.js'
import type {Account} from './Account.js'
import type {CreateSessionServices} from './createSession.js'
import {createSession} from './createSession.js'
import {getAccountByIdentifier} from './getAccountByIdentifier.js'

export async function createSessionForAccountIdentifier(
    db: Db<CreateSessionForAccountIdentifierServices>,
    accountIdentifier: string,
    model?: CreateSessionForAccountIdentifierModel
) {
    const $getAccountByIdentifier = db.getAccountByIdentifier ?? getAccountByIdentifier
    const $createSession = db.createSession ?? createSession
    // First we check if an account with the identifier (email) already exists.
    const accountModel = await $getAccountByIdentifier(db, accountIdentifier)

    // If it does not exist, we throw an error.
    if (! accountModel) {
        return throwInvalidRequest(
            '@eviljs/node-db-sql/createSessionForAccountIdentifier.createSessionForAccountIdentifier(db, ~~accountIdentifier~~, model):\n'
            + `accountIdentifier does not exist, given "${accountIdentifier}".`
        )
    }

    // The account exists.
    const accountId = accountModel.id as number

    return $createSession(db, accountId, model)
}

// Types ///////////////////////////////////////////////////////////////////////

export type CreateSessionForAccountIdentifierServices = {
    Account?: Account
    getAccountByIdentifier?: typeof getAccountByIdentifier
    createSession?: typeof createSession
} & CreateSessionServices

export interface CreateSessionForAccountIdentifierModel {
}
