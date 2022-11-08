import {assertObject} from '@eviljs/std/assert.js'

export function db(shell: DbShell) {
    assertObject(shell.container, 'shell.container')
    assertObject(shell.container.Db, 'shell.container.Db')

    return shell.container.Db
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DbShell {
    container: {
        Db: any
    }
}
