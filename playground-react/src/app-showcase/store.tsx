import {defineShowcase} from '@eviljs/reactx/showcase'
import {StoreState, useStoreState} from '~/store/hooks'

export default defineShowcase('Store', (props) => {
    const [theme, setTheme] = useStoreState((state: StoreState) => state.theme)

    return (
        <div>
        </div>
    )
})
