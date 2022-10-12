import type {ReadAccountOutput} from './outputs'
import type {ReadAccountResponse} from './responses'

export function mapAccountResponse(response: ReadAccountResponse): ReadAccountOutput {
    return {
        ...response,
    }
}
