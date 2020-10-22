import {queryAccount} from '../queries'
import {useAuth, AuthTokenState} from '@eviljs/std-react/auth.js'
import {useQuery} from '@eviljs/std-react/query.js'
import {useStore} from '../store'
import React from 'react'
const {useEffect} = React

export function useAccount() {
    const {token, tokenState, pending: pendingAuth} = useAuth()
    const {fetch, pending: pendingAccount, response} = useQuery(queryAccount)
    const {state, commit} = useStore()
    const pending = pendingAuth || pendingAccount

    useEffect(() => {
        if (! token || tokenState !== AuthTokenState.Valid) {
            // There is no (valid) token. We have nothing to fetch.
            return
        }

        if (state.account) {
            // We already have the account data. We have nothing to do.
            return
        }

        fetch(token)
    }, [token, tokenState, state.account])

    useEffect(() => {
        if (! response) {
            // We could already have the account data. We avoid to reset it.
            return
        }

        const account = response

        commit({type: 'set', value: {account}})
    }, [response])

    return {pending}
}
