export const Session = {
    Table: 'Sessions',
    toData(model: SessionModel): SessionData {
        return {
            id: model.id,
            account: model.account,
            token: model.token,
        }
    },
    fromData(data: SessionData): SessionModel {
        return {
            id: data.id,
            account: data.account,
            token: data.token,
        }
    },
} as const

// Types ///////////////////////////////////////////////////////////////////////

export type Session = typeof Session

export interface SessionData {
    id?: number
    account?: number
    token?: string
}

export interface SessionModel {
    id?: number
    account?: number
    token?: string
}
