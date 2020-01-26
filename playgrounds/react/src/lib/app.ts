import { App } from 'app/app'
import { ContainerSpec, Container } from './container'
import { createContainer } from 'std-lib/container'

export const AppSpec = {
    app: App,
    mountPoint: document.getElementById('App'),

    useAuth: true,
    useContainer: true,
    useCookie: true,
    useFetch: true,
    useI18n: true,
    useLogger: true,
    useQuery: true,
    useRouter: true,
    useStore: true,

    createContainer() { return createContainer(ContainerSpec) },
    createCookie(container?: Container) { return container!.Cookie },
    createFetch(container?: Container) { return container!.Fetch },
    createI18n(container?: Container) { return container!.I18n },
    createLogger(container?: Container) { return container!.Logger },
    createQuery(container?: Container) { return container!.Query },
    createStoreSpec(container?: Container) { return container!.StoreSpec },
}