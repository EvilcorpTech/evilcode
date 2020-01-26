import * as actions from './store-actions'

export const Actions = actions
export const StoreSpec = {actions, createState}

export function createState() {
    return {
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export type State = ReturnType<typeof createState>