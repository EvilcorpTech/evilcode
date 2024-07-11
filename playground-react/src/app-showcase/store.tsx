import {defineShowcase} from '@eviljs/reactx/showcase-v1/showcase'
import {MyStore, useMyStore, useMyStoreDispatch, useMyStoreState} from '~/store/store'
import {Theme} from '~/theme/theme-apis'

export default defineShowcase('Store', (props) => {
    const [theme, dispatch] = useMyStore(state => state.theme)

    return (
        <div className="std-flex std-gap6">
            <Comp1/>
            <Comp2/>

            {theme}
        </div>
    )
})

function Comp1() {
    const dispatch = useMyStoreDispatch()

    return (
        <div>
            <button
                onClick={() => {
                    dispatch(MyStore.Action.resetState())
                }}
            >
                Reset
            </button>
        </div>
    )
}

function Comp2() {
    const theme = useMyStoreState(state => state.theme)
    const dispatch = useMyStoreDispatch()

    return (
        <div>
            <input
                type="checkbox"
                onChange={event => {
                    event.currentTarget.checked
                        ? dispatch(MyStore.Action.setState({theme: Theme.Dark}))
                        : dispatch(MyStore.Action.setState({theme: Theme.Light}))
                }}
            />
        </div>
    )
}
