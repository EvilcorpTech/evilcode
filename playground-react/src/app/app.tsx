import {withAuth} from '@eviljs/react/auth'
import {withContainer} from '@eviljs/react/container'
import {withFetch} from '@eviljs/react/fetch'
import {withI18n} from '@eviljs/react/i18n'
import {withLogger} from '@eviljs/react/logger'
import {PortalProvider} from '@eviljs/react/portal'
import {withQuery} from '@eviljs/react/query'
import {withRouter, SwitchRoute, exact, Arg as _arg_} from '@eviljs/react/router'
import {withStore} from '@eviljs/react/store'
import React from 'react'
import {Container} from '../lib/container'
import {BasePath, RouterType} from '../lib/context'
import {AuthBarrier} from '../lib/widgets/auth-barrier'
import {NotFoundView} from './404-view'
import {AdminView} from './admin-view'
import {AuthView} from './auth-view'
import {HomeView} from './home-view'
import {UiView} from './ui-view'
const {Fragment} = React

export function App(props: AppProps) {
    const {container} = props

    let app = <AppMain/>
    app = withAuth(app, container.Fetch, container.Cookie)
    app = withContainer(app, container)
    app = withFetch(app, container.Fetch)
    app = withI18n(app, container.I18n)
    app = withLogger(app, container.Logger)
    app = withQuery(app, container.Query)
    app = withRouter(app, {type: RouterType, basePath: BasePath})
    app = withStore(app, container.StoreSpec)
    return app
}

export function AppMain(props: AppMainProps) {
    return (
        <PortalProvider children={Portal =>
            <Fragment>
                <SwitchRoute default={<NotFoundView/>}>
                    {[
                        {is: exact('/'), then:
                            <HomeView/>
                        },
                        {is: exact('/ui'), then:
                            <UiView/>
                        },
                        {is: exact('/admin'), then:
                            <AuthBarrier>
                                <AdminView/>
                            </AuthBarrier>
                        },
                        {is: exact('/auth'), then:
                            <AuthView/>
                        },
                        {is: exact(`/view/${_arg_}`), then: (id) =>
                            <h1>Example Route with param: {id}</h1>
                        },
                    ]}
                </SwitchRoute>

                <Portal/>
            </Fragment>
        }/>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AppProps {
    container: Container
}

export interface AppMainProps {
    className?: string
}
