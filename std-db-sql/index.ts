import { Logger } from '@eviljs/std-lib/logger'
import MariaDB from 'mariadb'

export const DbHost = 'localhost'
export const DbName = 'main'
export const DbPass = ''
export const DbPort = 3306
export const DbRetryDelay = 3 * 1000 // 3 seconds
export const DbUser = 'root'

export function DbService<S extends DbServices>(container: DbContainer<S>) {
    const { DbSpec: dbSpec } = container
    const { Context: context, Logger: logger } = container

    const spec = {
        host: context?.DB_HOST ?? process.env.DB_HOST ?? dbSpec?.host,
        logger: dbSpec?.logger ?? logger,
        name: context?.DB_NAME ?? process.env.DB_NAME ?? dbSpec?.name,
        pass: context?.DB_PASS ?? process.env.DB_PASS ?? dbSpec?.pass,
        port: context?.DB_PORT ?? process.env.DB_PORT ?? dbSpec?.port,
        retryDelay: dbSpec?.retryDelay,
        services: dbSpec?.services,
        user: context?.DB_USER ?? process.env.DB_USER ?? dbSpec?.user,
    }

    return createDb(spec)
}

export function createDb<S extends DbServices>(spec?: DbSpec<S>) {
    const self: Db<S> = {
        ...spec?.services as S, // TypeScript ugliness.

        host: spec?.host ?? DbHost,
        name: spec?.name ?? DbName,
        pass: spec?.pass ?? DbPass,
        port: spec?.port ?? DbPort,
        retryDelay: spec?.retryDelay ?? DbRetryDelay,
        user: spec?.user ?? DbUser,
        connectionPromise: void undefined,
        connection: void undefined,

        get url() {
            const credentials = `${self.user}:${encodeURIComponent(self.pass)}@`
            const url = `mysql+gz://${credentials}${self.host}:${self.port}`

            return url
        },

        ready() {
            return ready(self)
        },
        connect() {
            return connect(self)
        },
        query(...args) {
            return query(self, ...args)
        },
        batch(...args) {
            return batch(self, ...args)
        },
        withTransaction(...args) {
            return withTransaction(self, ...args)
        },
    }

    onExit(self)

    return self
}

export function ready(db: Db) {
    if (! db.connectionPromise) {
        db.connectionPromise = db.connect()
    }

    return db.connectionPromise
}

export async function connect(db: Db) {
    console.info('(Db) Connecting to', db.url.replace(/:[^:]*@/, ':*********@'))

    while (true) {
        try {
            const connection = await MariaDB.createConnection({
                host: db.host,
                port: Number(db.port),
                user: db.user,
                password: db.pass,
                database: db.name,
                compress: true,
                namedPlaceholders: false,
                nestTables: false,
                rowsAsArray: false,
            })

            connection.on('error', function onError(error) {
                db.connection = void undefined
                db.connectionPromise = void undefined
                console.warn('(Db) error:', error)
            })

            db.connection = connection

            return connection
        }
        catch (error) {
            // In case the Db instance is not ready while we are
            // booting, the connection will reject.
            // Until that, we have to re-try on our own.
            // We don't give up, retrying until the Db instance is ready.
            console.info('(Db) server is not ready yet')
            await waitFor(db.retryDelay)
            console.info('(Db) retrying...')
        }
    }
}

export async function query(db: Db, statement: string, params?: DbQueryParams) {
    const connection = await db.ready()
    const result = await connection.query(statement, params)
    return result
}

export async function batch(db: Db, statements: string, params?: DbBatchParams) {
    const connection = await db.ready()
    const result = await connection.batch(statements, params) as unknown as WriteResult
    return result
}

export async function withTransaction(db: Db, fn: Function) {
    const connection = await db.ready()
    await connection.beginTransaction()

    try {
        const result = await fn()
        await connection.commit()
        return result
    }
    catch (error) {
        connection.rollback()
        throw error
    }
}

export function onExit(db: Db) {
    process.on('exit', function onExit() {
        if (! db.connection) {
            return
        }

        console.debug('(Db) closing...')
        db.connection.end()
    })
}

export function waitFor(time: number) {
    const promise = new Promise((resolve, reject) => {
        setTimeout(resolve, time)
    })

    return promise
}

// Types ///////////////////////////////////////////////////////////////////////

export type Db<S extends DbServices = {}> = {
    host: string
    name: string
    pass: string
    port: string | number
    retryDelay: number
    url: string
    user: string

    connectionPromise?: Promise<MariaDB.Connection>
    connection?: MariaDB.Connection

    ready(): Promise<MariaDB.Connection>
    connect(): Promise<MariaDB.Connection>
    query(statement: string, params?: DbQueryParams): Promise<DbQueryResult>
    batch(statements: string, params?: DbBatchParams): Promise<WriteResult>
    withTransaction<R>(fn: () => R): Promise<R>
} & S

export interface DbContainer<S extends DbServices> {
    Context?: {
        DB_HOST?: string
        DB_PORT?: string | number
        DB_USER?: string
        DB_PASS?: string
        DB_NAME?: string
    }
    DbSpec?: DbSpec<S>
    Logger?: Logger
}

export interface DbSpec<S extends DbServices> {
    host?: string
    logger?: Logger
    name?: string
    pass?: string
    port?: string | number
    retryDelay?: number
    services?: S
    user?: string
}

export interface DbServices {
    [key: string]: unknown
}

export type DbQueryParams = Array<any> | readonly any[]
export type DbBatchParams = Array<Array<any>> | Array<readonly any[]>
export type DbQueryResult = ReadResult | WriteResult

export type ReadResult<R = Record<string, any>> = Array<R>
export type WriteResult = {affectedRows: number, insertId: number, warningStatus: number}
