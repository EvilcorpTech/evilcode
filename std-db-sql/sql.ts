import { isUndefined, ValueOf } from '@eviljs/std-lib/type'

/*
* Generates a series of tuples that can be used for persisting an object
* through an INSERT or an UPDATE.
*
* EXAMPLE
* const model = {id: ..., name: ..., phone: ..., email: ...}
* const cols = ['name', 'phone', 'email']
* const { columns, placeholders, values } = asTuple(model, cols)
* const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
*/
export function asTuple<O extends {}>(data: O, cols: Array<keyof O>) {
    const columns: Array<keyof O> = []
    const placeholders: Array<'?'> = []
    const values: Array<ValueOf<O>> = []

    for (const col of cols) {
        const val = data[col]

        if (isUndefined(val))  {
            continue
        }

        columns.push(col)
        placeholders.push('?')
        values.push(val)
    }

    return {columns, placeholders, values}
}

/*
* Generates an insert statement used for persisting an object.
*
* EXAMPLE
* const table = 'Accounts'
* const model = {id: ..., name: ..., phone: ..., email: ...}
* const cols = ['name', 'phone', 'email']
* const [ query, values ] = insert(table, model, cols)
*/
export function insert<O extends {}>(table: string, data: O, cols: Array<keyof O>, options?: InsertOptions) {
    const quote = options?.quote ?? '`'
    const { columns, placeholders, values } = asTuple(data, cols)

    return [`INSERT INTO ${quote}${table}${quote} (${columns}) VALUES (${placeholders})`, values]
}

/*
* Joins strings if the conditions are true.
*
* EXAMPLE
* joinStatement(
*     ['WHERE', 'ts >= ?', 'AND', 'ts <= ?'],
*     [start || end, start, start && end, end],
* )
*/
export function joinStatement(parts: Array<string>, conditions: Array<unknown>, separator = ' ') {
    const statement = parts
        .filter((it, idx) => Boolean(conditions[idx]))
        .join(separator)

    return statement
}

// Types ///////////////////////////////////////////////////////////////////////

export interface InsertOptions {
    quote?: string
}
