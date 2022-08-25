import {defineShowcase} from '@eviljs/reactx/showcase'
import {StoreState, useStoreState} from '~/hooks/store'

export default defineShowcase('Store', (props) => {
    const [theme, setTheme] = useStoreState((state: StoreState) => state.theme)

    return (
        <div>
        </div>
    )
})
