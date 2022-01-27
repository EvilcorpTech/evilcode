import {Button} from '@eviljs/reactx/button'
import {Input} from '@eviljs/reactx/input/floating'
import {defineShowcase} from '@eviljs/reactx/showcase'
import {State, useStore} from 'lib/hooks/store'

export default defineShowcase('Store', (props) => {
    const [theme, setTheme] = useStore((state: State) => state.theme)

    return (
        <div>

        </div>
    )
})
