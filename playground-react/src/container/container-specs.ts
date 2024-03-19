import {createConsoleLog, createLogger, type Logger, type LoggerProps} from '@eviljs/std/logger'
import type {Router} from '@eviljs/web/router'
import {createHashRouter} from '@eviljs/web/router-hash'
import {createPathRouter} from '@eviljs/web/router-path'
import {Env} from '~/env/env-specs'

export const MyContainerSpec = {
    Logger({}: MyContainerServices) {
        return createLogger(createConsoleLog())
    },
    Router({}: MyContainerServices) {
        return Env.RouterType === 'path'
            ? createPathRouter({basePath: Env.BasePath})
            : createHashRouter({basePath: Env.BasePath})
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export interface MyContainerServices {
    Logger: Logger & LoggerProps
    Router: Router
}

export interface MyContainerState {
}
