export const Account = {
    Table: 'Accounts',
    toData(model: AccountModel): AccountData {
        return {
            // The account secret is hashed using a salt.
            id: model.id,
            identifier: model.identifier?.toLowerCase(),
            secret_hash: model.secretHash,
        }
    },
    fromData(data: AccountData, options?: AccountFromDataOptions): AccountModel {
        return {
            id: data.id,
            identifier: data.identifier,
            secretHash: options?.withSecretHash === true
                ? data.secret_hash
                : void undefined
            ,
        }
    },
} as const

// Types ///////////////////////////////////////////////////////////////////////

export type Account = typeof Account

export interface AccountData {
    id?: undefined | number
    identifier?: undefined | string
    secret_hash?: undefined | string
}

export interface AccountModel {
    id?: undefined | number
    identifier?: undefined | string
    secretHash?: undefined | string
}

export interface AccountFromDataOptions {
    withSecretHash: boolean
}
