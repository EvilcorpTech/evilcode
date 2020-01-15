import { Account } from './Account'
import { createSession, CreateSessionServices } from './createSession'
import { Db } from '..'
import { getAccountByIdentifier } from './getAccountByIdentifier'
import { throwInvalidRequest } from '@eviljs/std-node/error'

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
            'std-db-sql/createSessionForAccountIdentifier.createSessionForAccountIdentifier(db, ~~accountIdentifier~~, model):\n'
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