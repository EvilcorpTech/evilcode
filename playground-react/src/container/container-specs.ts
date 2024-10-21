import {createConsoleLog, createLogger, type Logger, type LoggerProps} from '@eviljs/std/log'
import type {Router} from '@eviljs/web/router'
import {createHashRouter} from '@eviljs/web/router-hash'
import {createPathRouter} from '@eviljs/web/router-path'
import {Env} from '~/env/env-specs'

export const DemoContainerSpec = {
    Logger({}: DemoContainerServices) {
        return createLogger(createConsoleLog())
    },
    Router({}: DemoContainerServices) {
        return Env.RouterType === 'path'
            ? createPathRouter({basePath: Env.BasePath})
            : createHashRouter({basePath: Env.BasePath})
    },
}

// Types ///////////////////////////////////////////////////////////////////////

export interface DemoContainerServices {
    Logger: Logger & LoggerProps
    Router: Router
}

export interface DemoContainerState {
}
