import {assertFunction, assertObject} from '@eviljs/std-lib/assert'

export async function createAccountAndSession(
    shell: CreateAccountAndSessionShell,
    options?: CreateAccountAndSessionOptions
) {
    assertObject(shell.container, 'shell.container')
    assertObject(shell.container.Db, 'shell.container.Db')
    assertFunction(shell.container.Db.createAccount, 'shell.container.Db.createAccount')
    assertFunction(shell.container.Db.createSession, 'shell.container.Db.createSession')

    const accountModel = {
        identifier: 'demo',
        secret: 'demo',
        ...options,
    }

    const {Db: db} = shell.container
    const {createAccount, createSession} = db
    const accountId = await createAccount(db, accountModel)
    const token = await createSession(db, accountId)

    console.log()
    console.log(
        ` ACCOUNT CREATED\n` +
        ` id: ${accountId}\n` +
        ` identifier: ${accountModel.identifier}\n` +
        ` secret: ${accountModel.secret}\n` +
        ` token: ${token}`
    )
    console.log()

    return {...accountModel, id: accountId, token}
}

// Types ///////////////////////////////////////////////////////////////////////

export interface CreateAccountAndSessionShell {
    container: {
        Db: {
            createAccount(db: any, model: CreateAccountAndSessionOptions): Promise<string | number>
            createSession(db: any, account: string | number): Promise<string>
        }
    }
}

export interface CreateAccountAndSessionOptions {
    identifier: string
    secret: string
}