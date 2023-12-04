import type {Container as ContainerDefinition} from '@eviljs/std/container'
import {createConsoleLog, createLogger} from '@eviljs/std/logger'
import {createHashRouter} from '@eviljs/web/router-hash'
import {createPathRouter} from '@eviljs/web/router-path'
import {Env} from '~/env/env-specs'

export const ContainerSpec = {
    Logger(container: {}) {
        return createLogger(createConsoleLog())
    },
    Router(container: {}) {
        return Env.RouterType === 'path'
            ? createPathRouter({basePath: Env.BasePath})
            : createHashRouter({basePath: Env.BasePath})
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export type Container = ContainerDefinition<typeof ContainerSpec>
