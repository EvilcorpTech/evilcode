import {Button} from '@eviljs/reactx/button'
import {Input} from '@eviljs/reactx/input/floating'
import {defineShowcase} from '@eviljs/reactx/showcase'
import {StoreState, useStore} from '~/hooks/store'

export default defineShowcase('Store', (props) => {
    const [theme, setTheme] = useStore((state: StoreState) => state.theme)

    return (
        <div>
        </div>
    )
})
