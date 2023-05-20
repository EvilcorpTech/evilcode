import {useStoreState} from '@eviljs/react/store-v3'
import {defineShowcase} from '@eviljs/reactx/showcase'
import type {StoreState} from '~/store/apis'
import {Theme} from '~/theme/apis'

export default defineShowcase('Store v3', (props) => {
    const [theme] = useStoreState((state: StoreState) => state.theme)

    return (
        <div className="std-flex gap6">
            <Comp1/>
            <Comp2/>

            {theme}
        </div>
    )
})

function Comp1() {
    const [state, setState] = useStoreState((state: StoreState) => state)

    return (
        <div>
            <button
                onClick={() => {
                    setState({})
                }}
            >
                Reset
            </button>
        </div>
    )
}

function Comp2() {
    const [theme, setTheme] = useStoreState((state: StoreState) => state.theme)

    return (
        <div>
            <input
                type="checkbox"
                onChange={event => {
                    event.currentTarget.checked
                        ? setTheme(Theme.Dark)
                        : setTheme(Theme.Light)
                }}
            />
        </div>
    )
}
