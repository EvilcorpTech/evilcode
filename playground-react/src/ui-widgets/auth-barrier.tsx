import {useRoutePathLocalized} from '@eviljs/react/route'
import {Redirect} from '@eviljs/react/router'
import {Text} from '@eviljs/react/text'
import {AuthBarrier as Barrier} from '@eviljs/reactx/auth-barrier'
import {RoutePath} from '~/route/route-paths'

export function AuthBarrier(props: AuthBarrierProps) {
    const {children} = props
    const authRoute = useRoutePathLocalized(RoutePath.Auth)

    return (
        <Barrier
            progress={<AuthProgress/>}
            fallback={<Redirect to={authRoute.link()}/>}
        >
            {children}
        </Barrier>
    )
}

export function AuthProgress() {
    return (
        <Text tag="h1" className="std-flex std-flex-column std-flex-stack std-color-primary-accent">
            Authenticating...
        </Text>
    )
}

// Types ///////////////////////////////////////////////////////////////////////

export interface AuthBarrierProps {
    children: React.ReactNode
}
