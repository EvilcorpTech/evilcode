import {Account, AccountFromDataOptions} from './Account.js'
import {assertStringNotEmpty} from '@eviljs/std/assert.js'
import {compareWithSaltedHash} from '@eviljs/node/crypto.js'
import {Db} from '../index.js'
import {getAccountByIdentifier} from './getAccountByIdentifier.js'

/*
* EXAMPLE
*
* // Secret Hash is omitted from the results by default...
* getAccountByIdentifierAndSecret(db, identifier, secret)
* // ...but it can be explicitly requested.
* getAccountByIdentifierAndSecret(db, identifier, secret, ['id', 'identifier'], {withSecretHash: true})
*/
export async function getAccountByIdentifierAndSecret(
    db: Db<GetAccountByIdentifierAndSecretServices>,
    identifier: string,
    secret: string,
    options?: AccountFromDataOptions,
) {
    assertStringNotEmpty(identifier, 'identifier')
    assertStringNotEmpty(secret, 'secret')

    const $getAccountByIdentifier = db.getAccountByIdentifier ?? getAccountByIdentifier
    const accountModel = await $getAccountByIdentifier(db,
        identifier, {...options, withSecretHash: true}
    )

    if (! accountModel) {
        return {error: 'account_not_existing'}
    }

    const secretHash = accountModel.secretHash as string
    const secretDoesMatch = await compareWithSaltedHash(secret, secretHash)

    if (! secretDoesMatch) {
        return {error: 'secret_not_matching'}
    }

    return accountModel
}

// Types ///////////////////////////////////////////////////////////////////////

export type GetAccountByIdentifierAndSecretServices = {
    Account?: Account
    getAccountByIdentifier?: typeof getAccountByIdentifier
}
