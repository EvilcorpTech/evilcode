import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase'
import {StoreAction} from '~/store/store-v3-apis'
import {useStore, useStoreDispatch, useStoreState} from '~/store/store-v3-hooks'
import {Theme} from '~/theme/theme-apis'

export default defineShowcase('Store v3', (props) => {
    const [theme, dispatch] = useStore(state => state.theme)

    return (
        <div className="std-flex std-gap6">
            <Comp1/>
            <Comp2/>

            {theme}
        </div>
    )
})

function Comp1() {
    const dispatch = useStoreDispatch()

    return (
        <div>
            <button
                onClick={() => {
                    dispatch(StoreAction.resetState())
                }}
            >
                Reset
            </button>
        </div>
    )
}

function Comp2() {
    const theme = useStoreState(state => state.theme)
    const dispatch = useStoreDispatch()

    return (
        <div>
            <input
                type="checkbox"
                onChange={event => {
                    event.currentTarget.checked
                        ? dispatch(StoreAction.setState({theme: Theme.Dark}))
                        : dispatch(StoreAction.setState({theme: Theme.Light}))
                }}
            />
        </div>
    )
}
